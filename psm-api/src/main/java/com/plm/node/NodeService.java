package com.plm.node;
import com.plm.platform.authz.PolicyPort;
import com.plm.permission.ViewService;
import com.plm.node.link.internal.GraphValidationService;
import com.plm.node.link.internal.LinkService;
import com.plm.node.metamodel.MetaModelCachePort;
import com.plm.node.metamodel.internal.ValidationService;
import com.plm.node.version.internal.FingerPrintService;
import com.plm.node.version.internal.VersionService;
import com.plm.node.transaction.internal.PlmTransactionService;
import com.plm.node.transaction.internal.LockService;

import static java.util.Map.entry;

import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.LifecycleConfig;
import com.plm.platform.config.dto.LifecycleStateConfig;
import com.plm.platform.config.dto.LinkTypeConfig;
import com.plm.platform.config.dto.NodeTypeConfig;
import com.plm.shared.metadata.Metadata;
import com.plm.shared.metadata.MetadataService;
import com.plm.shared.model.Enums.ChangeType;
import com.plm.shared.model.Enums.VersionStrategy;
import com.plm.shared.model.ResolvedAttribute;
import com.plm.shared.action.PlmAction;
import com.plm.platform.authz.KeyExpr;
import com.plm.platform.authz.PlmPermission;
import com.plm.shared.security.SecurityContextPort;
import com.plm.shared.event.PlmEventPublisher;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CRUD sur les noeuds PLM.
 *
 * Point d'entrée pour toute modification : {@link #checkout}.
 * Le checkout fait trois choses dans l'ordre :
 *   1. Acquiert le lock sur le noeud (LockService.tryLock — atomique, sans tx)
 *   2. Trouve ou crée une transaction PLM
 *   3. Crée la version OPEN dans cette transaction (idempotent)
 *
 * Opérations sans txId (lecture seule) : buildObjectDescription
 *
 * createNode est un cas particulier : la version initiale est directement COMMITTED
 * (création = acte atomique, pas de review nécessaire).
 */
@Metadata(key = "frozen", target = "LIFECYCLE_STATE",
    description = "Blocks content modifications (checkout, attribute changes)")
@Slf4j
@Service
@RequiredArgsConstructor
public class NodeService {

    private final DSLContext                      dsl;
    private final ConfigCache                     configCache;
    private final LockService                     lockService;
    private final VersionService                  versionService;
    private final PlmTransactionService           txService;
    private final com.plm.platform.authz.PolicyPort policyService;
    private final ViewService                     viewService;
    private final ValidationService               validationService;
    private final FingerPrintService              fingerPrintService;
    private final PlmEventPublisher               eventPublisher;
    private final MetaModelCachePort               metaModelCache;
    private final LinkService                     linkService;
    private final GraphValidationService          graphValidationService;
    private final SecurityContextPort             secCtx;
    private final MetadataService                 metadataService;
    private final com.plm.shared.security.PnoProjectSpaceClient pnoProjectSpaceClient;

    // ================================================================
    // CRÉATION (pas de txId — version initiale directement COMMITTED)
    // ================================================================

    @PlmAction(value = "create_node", nodeTypeIdExpr = "#nodeTypeId")
    @Transactional
    public String createNode(
        String projectSpaceId,
        String nodeTypeId,
        String userId,
        Map<String, String> attributes,
        String logicalId,
        String externalId
    ) {
        NodeTypeConfig nodeType = configCache.getNodeType(nodeTypeId)
            .orElseThrow(() -> new IllegalArgumentException(
                "NodeType not found: " + nodeTypeId
            ));

        String label = (nodeType.logicalIdLabel() == null || nodeType.logicalIdLabel().isBlank())
            ? "Identifier" : nodeType.logicalIdLabel();
        String trimmedLogicalId = (logicalId == null) ? "" : logicalId.trim();

        if (trimmedLogicalId.isEmpty()) {
            throw new IllegalArgumentException("'" + label + "' is required");
        }

        String pattern = nodeType.logicalIdPattern();
        if (pattern != null && !pattern.isBlank() && !trimmedLogicalId.matches(pattern)) {
            throw new IllegalArgumentException(
                "'" + label + "' value '" + trimmedLogicalId
                    + "' does not match pattern: " + pattern
            );
        }

        int dup = dsl.fetchCount(
            dsl.selectOne().from("node").where("logical_id = ?", trimmedLogicalId)
        );
        if (dup > 0) {
            throw new IllegalArgumentException(
                "A node with " + label + " '" + trimmedLogicalId + "' already exists"
            );
        }

        String nodeId = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        dsl.execute(
            """
            INSERT INTO node (ID, NODE_TYPE_ID, PROJECT_SPACE_ID, LOGICAL_ID, EXTERNAL_ID, CREATED_AT, CREATED_BY)
            VALUES (?,?,?,?,?,?,?)
            """,
            nodeId,
            nodeTypeId,
            projectSpaceId,
            trimmedLogicalId,
            (externalId != null && !externalId.isBlank()) ? externalId.trim() : null,
            now,
            userId
        );

        // Lock the node immediately so it behaves like a checked-out node:
        // the UI shows Checkin/Abort instead of Checkout.
        lockService.tryLock(nodeId, userId);

        // Find or auto-create an OPEN transaction for this user.
        // The node will only become visible to others once the transaction is committed.
        String creationTxId = txService.findOpenTransaction(userId);
        if (creationTxId == null) {
            creationTxId = txService.openTransaction(userId);
        }

        String lifecycleId = nodeType.lifecycleId();
        String initialState = null;
        if (lifecycleId != null) {
            initialState = configCache.getLifecycle(lifecycleId)
                .map(LifecycleConfig::states)
                .flatMap(states -> states.stream()
                    .filter(LifecycleStateConfig::isInitial)
                    .map(LifecycleStateConfig::id)
                    .findFirst())
                .orElse(null);
        }

        // Version initiale — appartient à la transaction OPEN de l'utilisateur
        String versionId = UUID.randomUUID().toString();
        dsl.execute(
            """
            INSERT INTO node_version
              (ID, NODE_ID, VERSION_NUMBER, REVISION, ITERATION, LIFECYCLE_STATE_ID,
               CHANGE_TYPE, CHANGE_DESCRIPTION, TX_ID, VERSION_REASON, CREATED_AT, CREATED_BY)
            VALUES (?, ?, 1, 'A', 1, ?, 'CONTENT', 'Initial creation', ?, 'REVISE', ?, ?)
            """,
            versionId,
            nodeId,
            initialState,
            creationTxId,
            now,
            userId
        );

        // Hard schema + value-shape check (always blocking).
        // No nodeId yet — only node-type attrs are valid at create time.
        validationService.assertWritable(nodeTypeId, attributes, (String) null);

        for (Map.Entry<String, String> e : attributes.entrySet()) {
            dsl.execute(
                "INSERT INTO node_version_attribute (ID, NODE_VERSION_ID, ATTRIBUTE_DEF_ID, VALUE) VALUES (?,?,?,?)",
                UUID.randomUUID().toString(),
                versionId,
                e.getKey(),
                e.getValue()
            );
        }

        // Soft validations (required, regex, enum, identity pattern) are non-blocking
        // at write time — they will be enforced at commit by the PreCommitValidator.
        // The handler may surface them to the client as feedback.

        // Store fingerprint immediately so future on-the-fly re-computation isn't needed.
        String fp = fingerPrintService.compute(nodeId, versionId);
        dsl.execute(
            "UPDATE node_version SET fingerprint = ? WHERE id = ?",
            fp,
            versionId
        );

        eventPublisher.nodeCreated(nodeId, userId);
        log.info(
            "Node created: id={} type={} user={}",
            nodeId,
            nodeTypeId,
            userId
        );
        return nodeId;
    }

    // ================================================================
    // PAGED RESULT — wrapper for paginated list responses
    // ================================================================

    public record PagedResult<T>(List<T> items, int page, int size, int total) {}

    // ================================================================
    // LISTE — dernière version COMMITTED par noeud
    // ================================================================

    /**
     * Legacy overload for backward compatibility — returns page 0, size 50.
     */
    public PagedResult<Map<String, Object>> listNodes(String projectSpaceId) {
        return listNodes(projectSpaceId, 0, 50);
    }

    public PagedResult<Map<String, Object>> listNodes(String projectSpaceId, int page, int size) {
        // Resolve descendant spaces for hierarchy visibility
        List<String> spaceIds = pnoProjectSpaceClient.getDescendants(projectSpaceId);
        String placeholders = String.join(",", spaceIds.stream().map(s -> "?").toList());

        // Authorization gate (SQL-side): READ_NODE per nodeType. Get distinct node
        // type IDs in the visible spaces, run a batch permission check, then re-query
        // restricted to readable types. No row leaves the DB unless authorized.
        Set<String> distinctNodeTypeIds = new java.util.HashSet<>(dsl.fetch(
            "SELECT DISTINCT node_type_id FROM node WHERE project_space_id IN (%s)".formatted(placeholders),
            spaceIds.toArray()
        ).getValues("node_type_id", String.class));
        Map<String, Boolean> readableByNodeType = policyService.canOnNodeTypes("READ_NODE", distinctNodeTypeIds);
        Set<String> readableNodeTypeIds = readableByNodeType.entrySet().stream()
            .filter(Map.Entry::getValue)
            .map(Map.Entry::getKey)
            .collect(java.util.stream.Collectors.toSet());

        if (readableNodeTypeIds.isEmpty()) {
            return new PagedResult<>(List.of(), page, size, 0);
        }

        String ntPlaceholders = String.join(",", readableNodeTypeIds.stream().map(s -> "?").toList());
        Object[] args = new Object[spaceIds.size() + readableNodeTypeIds.size()];
        int idx = 0;
        for (String s : spaceIds)            args[idx++] = s;
        for (String nt : readableNodeTypeIds) args[idx++] = nt;

        // children_count counts links from all committed or open versions.
        List<Record> rows = dsl.fetch(
            """
            SELECT n.id, n.node_type_id,
                   nv.id AS version_id,
                   nv.lifecycle_state_id, nv.revision, nv.iteration, nv.version_number,
                   n.logical_id, n.external_id,
                   n.created_at, n.created_by,
                   n.locked_by,
                   pt.status AS tx_status,
                   (SELECT COUNT(*) FROM node_version_link nvl
                    JOIN node_version nv_lnk ON nv_lnk.id = nvl.source_node_version_id
                    JOIN plm_transaction pt_lnk ON pt_lnk.id = nv_lnk.tx_id
                    WHERE nv_lnk.node_id = n.id
                      AND pt_lnk.status IN ('COMMITTED', 'OPEN')) AS children_count
            FROM node n
            JOIN node_version nv ON nv.node_id = n.id
            JOIN plm_transaction pt ON pt.id = nv.tx_id
            WHERE n.project_space_id IN (%s)
              AND n.node_type_id IN (%s)
              AND pt.status IN ('COMMITTED', 'OPEN')
              AND nv.version_number = (
                SELECT MAX(nv2.version_number) FROM node_version nv2
                JOIN plm_transaction pt2 ON pt2.id = nv2.tx_id
                WHERE nv2.node_id = n.id
                  AND pt2.status IN ('COMMITTED', 'OPEN'))
            ORDER BY n.created_at DESC
            """.formatted(placeholders, ntPlaceholders),
            args
        );

        List<Map<String, Object>> all = rows.stream()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>(r.intoMap());
                String ntId = (String) m.get("node_type_id");
                m.put("node_type_name", configCache.getNodeType(ntId)
                    .map(NodeTypeConfig::name).orElse(ntId));
                String versionId = (String) m.get("version_id");
                m.put("display_name", resolveAsNameValue(ntId, versionId));
                return m;
            })
            .toList();

        int total = all.size();
        int offset = page * size;
        List<Map<String, Object>> pageItems = all.stream()
            .skip(offset)
            .limit(size)
            .toList();

        return new PagedResult<>(pageItems, page, size, total);
    }

    // ================================================================
    // HISTORIQUE — toutes les versions d'un noeud
    // ================================================================

    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public List<Map<String, Object>> getVersionHistory(String nodeId) {
        return dsl.fetch(
            """
            SELECT nv.id, nv.version_number, nv.revision, nv.iteration,
                   nv.lifecycle_state_id,
                   nv.change_type, nv.change_description,
                   nv.version_reason, nv.previous_version_id,
                   nv.previous_version_fingerprint, nv.branch, nv.created_by,
                   nv.fingerprint, nv.tx_id,
                   pt.commit_comment AS tx_comment,
                   pt.owner_id       AS tx_owner,
                   pt.committed_at   AS committed_at,
                   pt.status         AS tx_status
            FROM node_version nv
            JOIN plm_transaction pt ON pt.id = nv.tx_id
            WHERE nv.node_id = ?
              AND pt.status IN ('COMMITTED', 'OPEN')
            ORDER BY nv.version_number
            """,
            nodeId
        ).stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>(r.intoMap());
            String stateId = (String) m.get("lifecycle_state_id");
            m.put("state_name", resolveStateName(stateId));
            return m;
        }).toList();
    }

    // ================================================================
    // DIFF — comparaison de deux versions
    // ================================================================

    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public Map<String, Object> getVersionDiff(
        String nodeId,
        int v1Num,
        int v2Num
    ) {
        // Fetch both version records
        var v1 = dsl.fetchOne(
            """
            SELECT nv.id, nv.version_number, nv.revision, nv.iteration,
                   nv.lifecycle_state_id, nv.change_type, nv.fingerprint,
                   nv.created_by,
                   pt.commit_comment AS tx_comment,
                   pt.committed_at   AS committed_at
            FROM node_version nv
            JOIN plm_transaction pt ON pt.id = nv.tx_id
            WHERE nv.node_id = ? AND nv.version_number = ?
            """,
            nodeId,
            v1Num
        );

        var v2 = dsl.fetchOne(
            """
            SELECT nv.id, nv.version_number, nv.revision, nv.iteration,
                   nv.lifecycle_state_id, nv.change_type, nv.fingerprint,
                   nv.created_by,
                   pt.commit_comment AS tx_comment,
                   pt.committed_at   AS committed_at
            FROM node_version nv
            JOIN plm_transaction pt ON pt.id = nv.tx_id
            WHERE nv.node_id = ? AND nv.version_number = ?
            """,
            nodeId,
            v2Num
        );

        if (v1 == null || v2 == null) {
            throw new IllegalArgumentException(
                "Version not found for node " + nodeId
            );
        }

        String v1Id = v1.get("id", String.class);
        String v2Id = v2.get("id", String.class);

        // Fetch raw attributes for both versions, resolve name/label from ConfigCache
        String nodeTypeId = dsl.select().from("node").where("id = ?", nodeId)
            .fetchOne("node_type_id", String.class);
        var resolvedType = metaModelCache.get(nodeTypeId);
        Map<String, ResolvedAttribute> attrById = new LinkedHashMap<>();
        if (resolvedType != null) {
            resolvedType.attributes().forEach(a -> attrById.put(a.id(), a));
        }

        var v1Raw = dsl.fetch(
            "SELECT attribute_def_id, value FROM node_version_attribute WHERE node_version_id = ? ORDER BY attribute_def_id",
            v1Id);
        var v2Raw = dsl.fetch(
            "SELECT attribute_def_id, value FROM node_version_attribute WHERE node_version_id = ? ORDER BY attribute_def_id",
            v2Id);

        // Build attribute maps keyed by attribute code (slug)
        Map<String, String> v1AttrMap = new java.util.LinkedHashMap<>();
        Map<String, String> v1LabelMap = new java.util.LinkedHashMap<>();
        for (var r : v1Raw) {
            String attrCode = r.get("attribute_def_id", String.class);
            ResolvedAttribute attr = attrById.get(attrCode);
            String label = (attr != null && attr.label() != null && !attr.label().isBlank())
                ? attr.label() : attrCode;
            v1AttrMap.put(attrCode, r.get("value", String.class));
            v1LabelMap.put(attrCode, label);
        }
        Map<String, String> v2AttrMap = new java.util.LinkedHashMap<>();
        Map<String, String> v2LabelMap = new java.util.LinkedHashMap<>();
        for (var r : v2Raw) {
            String attrCode = r.get("attribute_def_id", String.class);
            ResolvedAttribute attr = attrById.get(attrCode);
            String label = (attr != null && attr.label() != null && !attr.label().isBlank())
                ? attr.label() : attrCode;
            v2AttrMap.put(attrCode, r.get("value", String.class));
            v2LabelMap.put(attrCode, label);
        }

        // Build diff list — union of all attribute codes
        var allAttrCodes = new java.util.LinkedHashSet<String>();
        allAttrCodes.addAll(v1AttrMap.keySet());
        allAttrCodes.addAll(v2AttrMap.keySet());

        var attrDiff = new ArrayList<Map<String, Object>>();
        for (var code : allAttrCodes) {
            String oldVal = v1AttrMap.get(code);
            String newVal = v2AttrMap.get(code);
            String label = v2LabelMap.getOrDefault(
                code,
                v1LabelMap.getOrDefault(code, code)
            );
            boolean changed = !Objects.equals(oldVal, newVal);
            attrDiff.add(
                Map.of(
                    "code",
                    code,
                    "label",
                    label,
                    "v1Value",
                    oldVal != null ? oldVal : "",
                    "v2Value",
                    newVal != null ? newVal : "",
                    "changed",
                    changed
                )
            );
        }

        String v1State = v1.get("lifecycle_state_id", String.class);
        String v2State = v2.get("lifecycle_state_id", String.class);

        // === LINK DIFF ===
        // "Active at version X" = all committed links whose source_node_version was created
        // at or before version X. Legacy links (null source_node_version_id) are always included.
        var v1Links = fetchLinksAtVersion(nodeId, v1Num);
        var v2Links = fetchLinksAtVersion(nodeId, v2Num);

        var v1LinkMap = new LinkedHashMap<String, Map<String, Object>>();
        for (var l : v1Links) v1LinkMap.put((String) l.get("linkId"), l);
        var v2LinkMap = new LinkedHashMap<String, Map<String, Object>>();
        for (var l : v2Links) v2LinkMap.put((String) l.get("linkId"), l);

        var allLinkIds = new LinkedHashSet<String>();
        allLinkIds.addAll(v2LinkMap.keySet());
        allLinkIds.addAll(v1LinkMap.keySet());

        var linkDiff = new ArrayList<Map<String, Object>>();
        for (var linkId : allLinkIds) {
            boolean inV1 = v1LinkMap.containsKey(linkId);
            boolean inV2 = v2LinkMap.containsKey(linkId);
            String status =
                inV1 && inV2 ? "UNCHANGED" : inV2 ? "ADDED" : "REMOVED";
            var base = inV2 ? v2LinkMap.get(linkId) : v1LinkMap.get(linkId);
            var entry2 = new LinkedHashMap<>(base);
            entry2.put("status", status);
            linkDiff.add(entry2);
        }

        var result = new LinkedHashMap<String, Object>();
        result.put("v1", buildVersionMeta(v1));
        result.put("v2", buildVersionMeta(v2));
        result.put("stateChanged", !Objects.equals(v1State, v2State));
        result.put("attributeDiff", attrDiff);
        result.put("linkDiff", linkDiff);
        return result;
    }

    private Map<String, Object> buildVersionMeta(Record v) {
        var m = new LinkedHashMap<String, Object>();
        m.put("versionNumber", v.get("version_number", Integer.class));
        m.put(
            "revision",
            Objects.toString(v.get("revision", String.class), "")
        );
        m.put("iteration", v.get("iteration", Integer.class));
        m.put(
            "changeType",
            Objects.toString(v.get("change_type", String.class), "")
        );
        m.put(
            "lifecycleStateId",
            Objects.toString(v.get("lifecycle_state_id", String.class), "")
        );
        m.put(
            "fingerprint",
            Objects.toString(v.get("fingerprint", String.class), "")
        );
        m.put(
            "createdBy",
            Objects.toString(v.get("created_by", String.class), "")
        );
        m.put(
            "txComment",
            Objects.toString(v.get("tx_comment", String.class), "")
        );
        m.put("committedAt", Objects.toString(v.get("committed_at"), ""));
        return m;
    }

    /**
     * Retourne tous les liens committed actifs pour un noeud source,
     * dont la version source a un version_number <= maxVersionNum.
     * La source du noeud est dérivée via source_node_version_id → node_version.node_id.
     */
    private List<Map<String, Object>> fetchLinksAtVersion(
        String nodeId,
        int maxVersionNum
    ) {
        String currentUserId = secCtx.currentUser().getUserId();
        return dsl
            .fetch(
                """
                SELECT nl.id AS link_id, nl.link_type_id,
                       nl.target_node_id, n.logical_id AS target_logical_id, n.node_type_id AS target_node_type_id,
                       nl.pinned_version_id,
                       pv.revision AS pinned_revision, pv.iteration AS pinned_iteration
                FROM node_version_link nl
                JOIN node n              ON n.id   = nl.target_node_id
                LEFT JOIN node_version pv ON pv.id = nl.pinned_version_id
                JOIN node_version src    ON src.id = nl.source_node_version_id
                JOIN plm_transaction spt ON spt.id = src.tx_id
                WHERE src.node_id = ?
                  AND (spt.status = 'COMMITTED' OR (spt.status = 'OPEN' AND spt.owner_id = ?))
                  AND src.version_number <= ?
                ORDER BY n.logical_id
                """,
                nodeId,
                currentUserId,
                maxVersionNum
            )
            .stream()
            .map(r -> {
                var m = new LinkedHashMap<String, Object>();
                m.put("linkId", r.get("link_id", String.class));
                String ltId = r.get("link_type_id", String.class);
                var lt = configCache.getLinkType(ltId);
                m.put("linkTypeName", lt.map(LinkTypeConfig::name).orElse(ltId));
                m.put("linkPolicy", lt.map(LinkTypeConfig::linkPolicy).orElse(""));
                m.put("targetNodeId", r.get("target_node_id", String.class));
                m.put(
                    "targetLogicalId",
                    Objects.toString(
                        r.get("target_logical_id", String.class),
                        ""
                    )
                );
                String targetNtId = r.get("target_node_type_id", String.class);
                m.put(
                    "targetNodeType",
                    configCache.getNodeType(targetNtId)
                        .map(NodeTypeConfig::name).orElse(targetNtId)
                );
                m.put(
                    "pinnedVersionId",
                    r.get("pinned_version_id", String.class)
                );
                m.put("pinnedRevision", r.get("pinned_revision", String.class));
                m.put(
                    "pinnedIteration",
                    r.get("pinned_iteration", Integer.class)
                );
                return (Map<String, Object>) m;
            })
            .toList();
    }

    // ================================================================
    // CHECKOUT — point d'entrée pour toute modification
    // ================================================================

    /**
     * Checkout d'un noeud : acquiert le lock, trouve ou crée une transaction,
     * puis crée la version OPEN dans cette transaction.
     *
     * Idempotent : si le noeud est déjà checké-out dans cette transaction,
     * retourne l'id de la version OPEN existante sans en créer une nouvelle.
     *
     * @param txId  transaction existante, ou {@code null} pour en trouver/créer une automatiquement
     * @return id de la version OPEN (nouvelle ou existante)
     */
    @PlmAction(value = "checkout", nodeIdExpr = "#nodeId")  // action_code = 'checkout' in action
    @Transactional
    public String checkout(String nodeId, String userId, String txId) {
        assertNotFrozen(nodeId);

        // 1. Acquérir le lock sur le noeud (atomique via SELECT FOR UPDATE, sans dépendance tx)
        lockService.tryLock(nodeId, userId);
        eventPublisher.lockAcquired(nodeId, userId);

        // 2. Trouver ou créer une transaction
        if (txId == null) {
            txId = txService.findOpenTransaction(userId);
            if (txId == null) txId = txService.openTransaction(userId);
        }

        // 3. Créer la version OPEN dans la transaction (idempotent)
        String existing = findOpenVersionInTx(nodeId, txId);
        if (existing != null) return existing;
        return versionService.createVersion(
            nodeId,
            userId,
            txId,
            ChangeType.CONTENT,
            resolveCheckoutStrategy(nodeId),
            null,
            Map.of(),
            "Checkout"
        );
    }

    // ================================================================
    // MODIFICATION — txId OBLIGATOIRE
    // ================================================================

    /**
     * Modifie le contenu d'un noeud dans le contexte d'une transaction explicite.
     * Le noeud doit être préalablement checké-out (lock acquis).
     *
     * @param txId      transaction PLM ouverte — OBLIGATOIRE
     * @param strategy  stratégie de numérotation (null = ITERATE par défaut)
     */
    @PlmAction(value = "update_node", nodeIdExpr = "#nodeId")
    @Transactional
    public String modifyNode(
        String nodeId,
        String userId,
        String txId,
        Map<String, String> attributes,
        String description,
        VersionStrategy strategy
    ) {
        assertNotFrozen(nodeId);
        lockService.tryLock(nodeId, userId);

        // Hard schema + value-shape check (always blocking).
        // Pass nodeId so the writable scope unions domain attrs across all versions
        // (committed + OPEN) — covers domains freshly attached to the OPEN version.
        String nodeTypeId = dsl.select().from("node").where("id = ?", nodeId)
            .fetchOne("node_type_id", String.class);
        validationService.assertWritable(nodeTypeId, attributes, nodeId);

        VersionStrategy effective =
            strategy != null ? strategy : VersionStrategy.ITERATE;

        String existingOpenVersionId = findOpenVersionInTx(nodeId, txId);
        String versionId =
            existingOpenVersionId != null
                ? versionService.updateVersionAttributes(
                      existingOpenVersionId,
                      attributes,
                      description
                  )
                : versionService.createVersion(
                      nodeId,
                      userId,
                      txId,
                      ChangeType.CONTENT,
                      effective,
                      null,
                      attributes,
                      description
                  );

        eventPublisher.nodeUpdated(nodeId, userId);
        return versionId;
    }

    /** Overload without strategy — defaults to ITERATE. */
    @PlmAction(value = "update_node", nodeIdExpr = "#nodeId")
    @Transactional
    public String modifyNode(
        String nodeId,
        String userId,
        String txId,
        Map<String, String> attributes,
        String description
    ) {
        return modifyNode(nodeId, userId, txId, attributes, description, null);
    }

    // ================================================================
    // LIENS — txId OBLIGATOIRE (delegates to LinkService)
    // ================================================================

    /**
     * Crée un lien entre deux noeuds dans une transaction.
     * Delegates to {@link LinkService#createLink}.
     */
    public String createLink(
        String linkTypeId,
        String sourceNodeId,
        String targetNodeId,
        String pinnedVersionId,
        String userId,
        String txId,
        String linkLogicalId
    ) {
        return linkService.createLink(
            linkTypeId, sourceNodeId, targetNodeId, pinnedVersionId, userId, txId, linkLogicalId
        );
    }

    // ================================================================
    // SERVER-DRIVEN UI (lecture — pas de txId requis, mais le prend en compte)
    // ================================================================

    /**
     * Construit le payload complet pour le frontend.
     *
     * Si txId est fourni : montre la version OPEN de la transaction (si le user en est le owner).
     * Sinon : montre la dernière version COMMITTED.
     *
     * Pipeline : règle d'état → override de vue → can_write → filtrage des actions par rôle.
     */
    /** Backward-compatible overload — no historical version pinning. */
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public Map<String, Object> buildObjectDescription(
        String nodeId,
        String userId,
        String txId
    ) {
        return buildObjectDescription(nodeId, userId, txId, null);
    }

    /**
     * Builds the full UI payload for a node.
     *
     * @param versionNumber when non-null, pins the view to that specific historical version
     *                      (all attributes are forced read-only, actions list is empty).
     */
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public Map<String, Object> buildObjectDescription(
        String nodeId,
        String userId,
        String txId,
        Integer versionNumber
    ) {

        boolean historicalView = versionNumber != null;

        Record current;
        if (historicalView) {
            current = dsl.fetchOne(
                "SELECT nv.* FROM node_version nv " +
                "JOIN plm_transaction pt ON pt.id = nv.tx_id " +
                "WHERE nv.node_id = ? AND nv.version_number = ? " +
                "AND pt.status IN ('COMMITTED', 'OPEN')",
                nodeId, versionNumber
            );
            if (current == null) throw new IllegalArgumentException(
                "Version " + versionNumber + " not found for node: " + nodeId
            );
        } else {
            current =
                txId != null
                    ? versionService.getCurrentVersionForTx(nodeId, txId)
                    : txService.getCurrentVisibleVersion(nodeId);
        }

        if (current == null) throw new IllegalStateException(
            "Node has no visible version: " + nodeId
        );

        String nodeTypeId = dsl
            .select()
            .from("node")
            .where("id = ?", nodeId)
            .fetchOne("node_type_id", String.class);
        String currentStateId = current.get("lifecycle_state_id", String.class);
        String currentStateName = currentStateId != null
            ? findStateName(currentStateId)
            : null;
        String revision = current.get("revision", String.class);
        int iteration = current.get("iteration", Integer.class);
        String versionId = current.get("id", String.class);
        String currentTxId = current.get("tx_id", String.class);
        String txStatus = dsl
            .select()
            .from("plm_transaction")
            .where("id = ?", currentTxId)
            .fetchOne("status", String.class);

        String activeViewId = viewService.resolveActiveView(
            nodeTypeId,
            currentStateId
        );
        LockService.LockInfo lockInfo = lockService.getLockInfo(nodeId);

        // Identity fields — logical_id and external_id are on node (not versioned)
        NodeTypeConfig nodeTypeConfig = configCache.getNodeType(nodeTypeId)
            .orElseThrow(() -> new IllegalStateException(
                "NodeType not found in config cache: " + nodeTypeId
            ));
        String lifecycleId = nodeTypeConfig.lifecycleId();
        String logicalIdLabel = nodeTypeConfig.logicalIdLabel();
        String logicalIdPattern = nodeTypeConfig.logicalIdPattern();

        Record nodeRecord = dsl
            .select()
            .from("node")
            .where("id = ?", nodeId)
            .fetchOne();
        String logicalId = nodeRecord.get("logical_id", String.class);
        String externalId = nodeRecord.get("external_id", String.class);

        // Valeurs courantes
        Map<String, String> currentValues = new java.util.HashMap<>();
        dsl
            .select()
            .from("node_version_attribute")
            .where("node_version_id = ?", versionId)
            .fetch()
            .forEach(r ->
                currentValues.put(
                    r.get("attribute_def_id", String.class),
                    r.get("value", String.class)
                )
            );

        // Resolve the as_name attribute value for display (uses cache — includes inherited)
        var resolvedNodeType = metaModelCache.get(nodeTypeId);
        String asNameAttrId = resolvedNodeType != null
            ? resolvedNodeType.attributes().stream()
                  .filter(ResolvedAttribute::asName)
                  .map(ResolvedAttribute::id)
                  .findFirst().orElse(null)
            : null;
        String displayName = asNameAttrId != null
            ? currentValues.getOrDefault(asNameAttrId, "")
            : "";

        // Attributs résolus avec règle d'état + override de vue (inherited attrs included via cache)
        // Merge node_type attributes + domain attributes
        var baseAttrs = resolvedNodeType != null
            ? resolvedNodeType.attributes()
            : List.<ResolvedAttribute>of();
        List<String> assignedDomainIds = dsl.select(DSL.field("domain_id"))
            .from("node_version_domain")
            .where("node_version_id = ?", versionId)
            .fetch("domain_id", String.class);
        List<ResolvedAttribute> effectiveAttrs = new ArrayList<>(baseAttrs);
        Set<String> nodeTypeAttrNames = baseAttrs.stream()
            .map(ResolvedAttribute::name).collect(Collectors.toSet());
        for (String domId : assignedDomainIds) {
            for (ResolvedAttribute da : metaModelCache.getDomainAttributes(domId)) {
                if (!nodeTypeAttrNames.contains(da.name())) {
                    effectiveAttrs.add(da);
                }
            }
        }
        var attributes = effectiveAttrs.stream()
            .map(attr -> {
                String attrId = attr.id();
                // Use scoped state rule — child type's override first, then owner's rule
                MetaModelCachePort.StateRuleInfo rule = currentStateId != null
                    ? metaModelCache.getStateRuleInfo(nodeTypeId, attrId, currentStateId)
                    : null;

                boolean stateEditable =
                    rule == null || rule.editable();
                boolean stateVisible =
                    rule == null || rule.visible();

                ViewService.AttributeOverride ov =
                    viewService.applyViewOverride(
                        activeViewId,
                        attrId,
                        stateEditable,
                        stateVisible,
                        attr.displayOrder(),
                        attr.displaySection()
                    );

                if (!ov.visible()) return null;

                boolean requiredByState =
                    rule != null && rule.required();
                boolean requiredGlobal = attr.required();

                return Map.<String, Object>ofEntries(
                    entry("id", attrId),
                    entry("code", attrId),
                    entry("label", attr.label()),
                    entry("value", currentValues.getOrDefault(attrId, "")),
                    entry("type", attr.dataType()),
                    entry("widget", attr.widgetType()),
                    entry(
                        "section",
                        ov.displaySection() != null ? ov.displaySection() : ""
                    ),
                    entry("displayOrder", ov.displayOrder()),
                    entry("editable", ov.editable()),
                    entry("required", requiredByState || requiredGlobal),
                    entry(
                        "namingRegex",
                        attr.namingRegex() != null ? attr.namingRegex() : ""
                    ),
                    entry(
                        "allowedValues",
                        attr.allowedValues() != null ? attr.allowedValues() : ""
                    ),
                    entry("tooltip", attr.tooltip() != null ? attr.tooltip() : ""),
                    entry("sourceDomainId", attr.sourceDomainId() != null ? attr.sourceDomainId() : ""),
                    entry("sourceDomainName", attr.sourceDomainName() != null ? attr.sourceDomainName() : "")
                );
            })
            .filter(Objects::nonNull)
            .toList();

        var result = new java.util.LinkedHashMap<String, Object>();
        result.put("nodeId", nodeId);
        result.put("technicalId", nodeId);
        result.put("logicalId", logicalId != null ? logicalId : "");
        result.put("externalId", externalId != null ? externalId : "");
        result.put(
            "logicalIdLabel",
            logicalIdLabel != null ? logicalIdLabel : "Identifier"
        );
        result.put(
            "logicalIdPattern",
            logicalIdPattern != null ? logicalIdPattern : ""
        );
        result.put(
            "identity",
            logicalId != null && !logicalId.isBlank()
                ? logicalId
                : revision + "." + iteration
        );
        result.put("displayName", displayName);
        result.put("revision", revision);
        result.put("iteration", iteration);
        result.put("state", currentStateId != null ? currentStateId : "");
        result.put("stateName", currentStateName != null ? currentStateName : "");
        result.put("txStatus", txStatus != null ? txStatus : "COMMITTED");
        result.put("lifecycleId", lifecycleId != null ? lifecycleId : "");
        // Look up the OPEN version's txId separately — lock is tx-agnostic on node table.
        String lockTxId = lockInfo.locked()
            ? dsl
                  .select(DSL.field("tx_id"))
                  .from("node_version")
                  .where("node_id = ?", nodeId)
                  .and(
                      DSL.exists(
                          dsl
                              .selectOne()
                              .from("plm_transaction")
                              .where("id = node_version.tx_id")
                              .and("status = 'OPEN'")
                      )
                  )
                  .limit(1)
                  .fetchOne(DSL.field("tx_id"), String.class)
            : null;
        result.put(
            "lock",
            Map.of(
                "locked",
                lockInfo.locked(),
                "lockedBy",
                lockInfo.lockedBy() != null ? lockInfo.lockedBy() : "",
                "txId",
                lockTxId != null ? lockTxId : ""
            )
        );
        result.put("nodeTypeId", nodeTypeId);
        result.put("currentVersionId", versionId);
        result.put("attributes", attributes);
        // Domain assignments
        List<Map<String, Object>> domainList = new ArrayList<>();
        var domainInfos = metaModelCache.getAllDomainInfos();
        for (String domId : assignedDomainIds) {
            var domInfo = domainInfos.get(domId);
            if (domInfo != null) {
                domainList.add(Map.of(
                    "id", domId,
                    "name", domInfo.name() != null ? domInfo.name() : ""
                ));
            }
        }
        result.put("domains", domainList);
        result.put("historicalView", historicalView);
        if (historicalView) result.put("versionNumber", versionNumber);

        // fingerprintChanged: true when the OPEN version has different content than its parent.
        // Only meaningful when txStatus == OPEN; always null otherwise.
        if ("OPEN".equals(txStatus)) {
            String previousVersionId = dsl
                .select(DSL.field("previous_version_id"))
                .from("node_version")
                .where("id = ?", versionId)
                .fetchOne(DSL.field("previous_version_id"), String.class);
            String parentFingerprint = previousVersionId != null
                ? dsl
                    .select(DSL.field("fingerprint"))
                    .from("node_version")
                    .where("id = ?", previousVersionId)
                    .fetchOne(DSL.field("fingerprint"), String.class)
                : null;
            String currentFingerprint = fingerPrintService.compute(nodeId, versionId);
            result.put("fingerprintChanged", !Objects.equals(currentFingerprint, parentFingerprint));
        } else {
            result.put("fingerprintChanged", null);
        }

        return result;
    }

    /** Returns the current lifecycle_state_id for a node, considering an open tx if provided. */
    public String getCurrentStateId(String nodeId, String txId) {
        Record current =
            txId != null
                ? versionService.getCurrentVersionForTx(nodeId, txId)
                : versionService.getCurrentVersion(nodeId);
        return current != null
            ? current.get("lifecycle_state_id", String.class)
            : null;
    }

    // ================================================================
    // LIENS — lecture (delegates to LinkService)
    // ================================================================

    /**
     * Retourne les liens sortants du noeud (BOM / enfants).
     */
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public List<Map<String, Object>> getChildLinks(String nodeId) {
        return linkService.getChildLinks(nodeId);
    }

    /**
     * Retourne les liens entrants vers ce noeud (Where Used / parents).
     */
    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public List<Map<String, Object>> getParentLinks(String nodeId) {
        return linkService.getParentLinks(nodeId);
    }

    /**
     * Deletes a link by ID. Delegates to {@link LinkService#deleteLink}.
     */
    public void deleteLink(String linkId, String userId, String txId) {
        linkService.deleteLink(linkId, userId, txId);
    }

    /**
     * Updates target and/or link_logical_id of an existing link.
     * Delegates to {@link LinkService#updateLink}.
     */
    public void updateLink(
        String linkId,
        String newTargetNodeId,
        String newLogicalId,
        String userId,
        String txId
    ) {
        linkService.updateLink(linkId, newTargetNodeId, newLogicalId, userId, txId);
    }

    // ================================================================
    // Helpers
    // ================================================================

    /** Resolves the as_name attribute value for a node version from ConfigCache + DB. */
    private String resolveAsNameValue(String nodeTypeId, String versionId) {
        if (nodeTypeId == null || versionId == null) return null;
        var nt = metaModelCache.get(nodeTypeId);
        if (nt == null) return null;
        String asNameAttrId = nt.attributes().stream()
            .filter(ResolvedAttribute::asName)
            .map(ResolvedAttribute::id)
            .findFirst().orElse(null);
        if (asNameAttrId == null) return null;
        return dsl.select(DSL.field("value")).from("node_version_attribute")
            .where("node_version_id = ?", versionId)
            .and("attribute_def_id = ?", asNameAttrId)
            .fetchOne("value", String.class);
    }

    private String resolveStateName(String stateId) {
        if (stateId == null) return "";
        for (LifecycleConfig lc : configCache.getAllLifecycles()) {
            if (lc.states() != null) {
                for (LifecycleStateConfig st : lc.states()) {
                    if (stateId.equals(st.id())) return st.name();
                }
            }
        }
        return stateId;
    }

    /**
     * Retourne l'id de la version OPEN de ce noeud dans cette transaction, ou null.
     */
    private String findOpenVersionInTx(String nodeId, String txId) {
        // All versions belonging to an OPEN transaction are by definition "open"
        return dsl
            .select()
            .from("node_version")
            .where("node_id = ?", nodeId)
            .and("tx_id = ?", txId)
            .orderBy(DSL.field("version_number").desc())
            .limit(1)
            .fetchOne("id", String.class);
    }

    private void validateNodeType(String nodeId, String expectedTypeId) {
        String actual = dsl
            .select()
            .from("node")
            .where("id = ?", nodeId)
            .fetchOne("node_type_id", String.class);
        if (!isTypeOrDescendant(actual, expectedTypeId)) throw new IllegalArgumentException(
            "Node " + nodeId + " wrong type, expected " + expectedTypeId
        );
    }

    /**
     * Returns true if typeId equals expectedTypeId or has expectedTypeId as an ancestor
     * (walking parent_node_type_id up the hierarchy).
     */
    private boolean isTypeOrDescendant(String typeId, String expectedTypeId) {
        String current = typeId;
        while (current != null) {
            if (expectedTypeId.equals(current)) return true;
            String finalCurrent = current;
            current = configCache.getNodeType(finalCurrent)
                .map(NodeTypeConfig::parentNodeTypeId)
                .orElse(null);
        }
        return false;
    }

    /**
     * Delegates cycle detection to {@link GraphValidationService}.
     */
    private void assertNoCycle(String sourceNodeId, String targetNodeId) {
        graphValidationService.assertNoCycle(sourceNodeId, targetNodeId);
    }

    /**
     * Reads the version_policy of the node's NodeType and maps it to a VersionStrategy
     * for use during checkout.
     *
     *   NONE    → VersionStrategy.NONE    (same revision.iteration, traceability only)
     *   ITERATE → VersionStrategy.ITERATE (iteration + 1, A.1 → A.2)
     *   RELEASE → VersionStrategy.REVISE  (new revision, A.x → B.1)
     */
    private VersionStrategy resolveCheckoutStrategy(String nodeId) {
        String nodeTypeId = dsl
            .select()
            .from("node")
            .where("id = ?", nodeId)
            .fetchOne("node_type_id", String.class);
        String policy = nodeTypeId != null
            ? configCache.getNodeType(nodeTypeId)
                  .map(NodeTypeConfig::versionPolicy)
                  .orElse(null)
            : null;
        if (policy == null) return VersionStrategy.ITERATE;
        return switch (policy) {
            case "NONE" -> VersionStrategy.NONE;
            case "RELEASE" -> VersionStrategy.REVISE;
            default -> VersionStrategy.ITERATE;
        };
    }

    /**
     * Finds a lifecycle state by its ID, searching across all lifecycles in the config cache.
     */
    private LifecycleStateConfig findState(String stateId) {
        for (LifecycleConfig lc : configCache.getAllLifecycles()) {
            if (lc.states() != null) {
                for (LifecycleStateConfig s : lc.states()) {
                    if (s.id().equals(stateId)) return s;
                }
            }
        }
        return null;
    }

    /**
     * Returns the display name of a lifecycle state, or null if not found.
     */
    private String findStateName(String stateId) {
        LifecycleStateConfig state = findState(stateId);
        return state != null ? state.name() : null;
    }

    /**
     * Throws FrozenStateException if the node's current lifecycle state has
     * metadata key "frozen" = "true".
     * A frozen state prohibits content modifications (checkout / modifyNode).
     * Lifecycle transitions and signatures are still allowed.
     */
    private void assertNotFrozen(String nodeId) {
        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) return;
        String stateId = current.get("lifecycle_state_id", String.class);
        if (stateId == null) return;
        if (metadataService.isTrue("LIFECYCLE_STATE", stateId, "frozen")) {
            throw new FrozenStateException(nodeId, stateId);
        }
    }

    public static class FrozenStateException
        extends com.plm.shared.exception.PlmFunctionalException
    {

        public FrozenStateException(String nodeId, String stateId) {
            super(
                "Node " +
                    nodeId +
                    " is in a frozen state (" +
                    stateId +
                    ") — content modifications are not allowed",
                422
            );
        }
    }

    public static class CircularReferenceException
        extends com.plm.shared.exception.PlmFunctionalException
    {

        public CircularReferenceException(
            String sourceNodeId,
            String targetNodeId
        ) {
            super(
                "Circular reference: linking " +
                    sourceNodeId +
                    " → " +
                    targetNodeId +
                    " would create a cycle in the structure",
                422
            );
        }
    }
}
