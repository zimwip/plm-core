package com.plm.domain.service;

import com.plm.domain.model.Enums.ChangeType;
import com.plm.domain.model.Enums.VersionStrategy;
import com.plm.infrastructure.PlmEventPublisher;
import com.plm.infrastructure.security.PlmSecurityContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import static java.util.Map.entry;
import java.util.Objects;
import java.util.UUID;

/**
 * CRUD sur les noeuds PLM.
 *
 * Point d'entrée pour toute modification : {@link #checkout}.
 * Le checkout fait trois choses dans l'ordre :
 *   1. Acquiert le lock sur le noeud (LockService.tryLock — atomique, sans tx)
 *   2. Trouve ou crée une transaction PLM
 *   3. Crée la version OPEN dans cette transaction (idempotent)
 *
 * Opérations sans txId (lecture seule) : createNode, buildObjectDescription
 *
 * createNode est un cas particulier : la version initiale est directement COMMITTED
 * (création = acte atomique, pas de review nécessaire).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NodeService {

    private final DSLContext                         dsl;
    private final LockService                        lockService;
    private final VersionService                     versionService;
    private final PlmTransactionService              txService;
    private final PermissionService                  permissionService;
    private final ValidationService                  validationService;
    private final FingerPrintService                 fingerPrintService;
    private final com.plm.domain.action.ActionService actionService;
    private final PlmEventPublisher                   eventPublisher;

    // ================================================================
    // CRÉATION (pas de txId — version initiale directement COMMITTED)
    // ================================================================

    @Transactional
    public String createNode(String projectSpaceId, String nodeTypeId, String userId,
                             Map<String, String> attributes, String logicalId, String externalId) {
        Record nodeType = dsl.select().from("node_type").where("id = ?", nodeTypeId).fetchOne();
        if (nodeType == null) throw new IllegalArgumentException("NodeType not found: " + nodeTypeId);

        String nodeId = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        dsl.execute("""
            INSERT INTO node (ID, NODE_TYPE_ID, PROJECT_SPACE_ID, LOGICAL_ID, EXTERNAL_ID, CREATED_AT, CREATED_BY)
            VALUES (?,?,?,?,?,?,?)
            """,
            nodeId, nodeTypeId, projectSpaceId,
            (logicalId  != null && !logicalId.isBlank())  ? logicalId  : null,
            (externalId != null && !externalId.isBlank()) ? externalId : null,
            now, userId);

        // Auto-créer une transaction committée pour la création initiale.
        // Toute node_version doit appartenir à une transaction.
        String creationTxId = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO plm_transaction (ID, OWNER_ID, STATUS, COMMIT_COMMENT, CREATED_AT, COMMITTED_AT)
            VALUES (?, ?, 'COMMITTED', 'Initial creation', ?, ?)
            """, creationTxId, userId, now, now);

        String lifecycleId  = nodeType.get("lifecycle_id", String.class);
        String initialState = null;
        if (lifecycleId != null) {
            initialState = dsl.select().from("lifecycle_state")
                .where("lifecycle_id = ?", lifecycleId).and("is_initial = 1")
                .fetchOne("id", String.class);
        }

        // Version initiale — appartient à la transaction de création (déjà committée)
        String versionId = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO node_version
              (ID, NODE_ID, VERSION_NUMBER, REVISION, ITERATION, LIFECYCLE_STATE_ID,
               CHANGE_TYPE, CHANGE_DESCRIPTION, TX_ID, VERSION_REASON, CREATED_AT, CREATED_BY)
            VALUES (?, ?, 1, 'A', 1, ?, 'CONTENT', 'Initial creation', ?, 'REVISE', ?, ?)
            """, versionId, nodeId, initialState, creationTxId, now, userId);

        for (Map.Entry<String, String> e : attributes.entrySet()) {
            dsl.execute("INSERT INTO node_version_attribute (ID, NODE_VERSION_ID, ATTRIBUTE_DEF_ID, VALUE) VALUES (?,?,?,?)",
                UUID.randomUUID().toString(), versionId, e.getKey(), e.getValue());
        }

        // Always validate: identity pattern + required/regex on attributes.
        // stateId may be null when the node type has no lifecycle — that's fine.
        List<String> violations = validationService.collectContentViolations(nodeId, initialState, attributes);
        if (!violations.isEmpty()) {
            throw new ValidationService.ValidationException(violations);
        }

        // Store fingerprint immediately so future on-the-fly re-computation isn't needed.
        String fp = fingerPrintService.compute(nodeId, versionId);
        dsl.execute("UPDATE node_version SET fingerprint = ? WHERE id = ?", fp, versionId);

        eventPublisher.nodeCreated(nodeId, userId);
        log.info("Node created: id={} type={} user={}", nodeId, nodeTypeId, userId);
        return nodeId;
    }

    /**
     * Convenience overload without identity fields (backward-compatible).
     */
    @Transactional
    public String createNode(String projectSpaceId, String nodeTypeId, String userId,
                             Map<String, String> attributes) {
        return createNode(projectSpaceId, nodeTypeId, userId, attributes, null, null);
    }

    // ================================================================
    // LISTE — dernière version COMMITTED par noeud
    // ================================================================

    public List<Record> listNodes(String projectSpaceId) {
        return dsl.fetch("""
            SELECT n.id, n.node_type_id, nt.name AS node_type_name,
                   nv.lifecycle_state_id, nv.revision, nv.iteration, nv.version_number,
                   n.logical_id, n.external_id,
                   n.created_at, n.created_by,
                   n.locked_by
            FROM node n
            JOIN node_type nt ON nt.id = n.node_type_id
            JOIN node_version nv ON nv.node_id = n.id
            JOIN plm_transaction pt ON pt.id = nv.tx_id
            WHERE pt.status = 'COMMITTED'
              AND n.project_space_id = ?
              AND nv.version_number = (
                SELECT MAX(nv3.version_number) FROM node_version nv3
                JOIN plm_transaction pt3 ON pt3.id = nv3.tx_id
                WHERE nv3.node_id = n.id AND pt3.status = 'COMMITTED')
            ORDER BY n.created_at DESC
            """, projectSpaceId);
    }

    // ================================================================
    // HISTORIQUE — toutes les versions d'un noeud
    // ================================================================

    public List<Record> getVersionHistory(String nodeId) {
        return dsl.fetch("""
            SELECT nv.id, nv.version_number, nv.revision, nv.iteration,
                   nv.lifecycle_state_id, ls.name AS state_name,
                   nv.change_type, nv.change_description,
                   nv.version_reason, nv.previous_version_id, nv.created_by,
                   nv.fingerprint, nv.tx_id,
                   pt.commit_comment AS tx_comment,
                   pt.owner_id       AS tx_owner,
                   pt.committed_at   AS committed_at
            FROM node_version nv
            JOIN plm_transaction pt ON pt.id = nv.tx_id
            LEFT JOIN lifecycle_state ls ON ls.id = nv.lifecycle_state_id
            WHERE nv.node_id = ? AND pt.status = 'COMMITTED'
            ORDER BY nv.version_number
            """, nodeId);
    }

    // ================================================================
    // DIFF — comparaison de deux versions
    // ================================================================

    public Map<String, Object> getVersionDiff(String nodeId, int v1Num, int v2Num) {
        // Fetch both version records
        var v1 = dsl.fetchOne("""
            SELECT nv.id, nv.version_number, nv.revision, nv.iteration,
                   nv.lifecycle_state_id, nv.change_type, nv.fingerprint,
                   nv.created_by,
                   pt.commit_comment AS tx_comment,
                   pt.committed_at   AS committed_at
            FROM node_version nv
            JOIN plm_transaction pt ON pt.id = nv.tx_id
            WHERE nv.node_id = ? AND nv.version_number = ?
            """, nodeId, v1Num);

        var v2 = dsl.fetchOne("""
            SELECT nv.id, nv.version_number, nv.revision, nv.iteration,
                   nv.lifecycle_state_id, nv.change_type, nv.fingerprint,
                   nv.created_by,
                   pt.commit_comment AS tx_comment,
                   pt.committed_at   AS committed_at
            FROM node_version nv
            JOIN plm_transaction pt ON pt.id = nv.tx_id
            WHERE nv.node_id = ? AND nv.version_number = ?
            """, nodeId, v2Num);

        if (v1 == null || v2 == null) {
            throw new IllegalArgumentException("Version not found for node " + nodeId);
        }

        String v1Id = v1.get("id", String.class);
        String v2Id = v2.get("id", String.class);

        // Fetch attributes for both versions (with label from attribute_definition)
        var v1Attrs = dsl.fetch("""
            SELECT ad.id AS attr_id, ad.name, ad.label, nva.value
            FROM node_version_attribute nva
            JOIN attribute_definition ad ON ad.id = nva.attribute_def_id
            WHERE nva.node_version_id = ?
            ORDER BY ad.name
            """, v1Id);

        var v2Attrs = dsl.fetch("""
            SELECT ad.id AS attr_id, ad.name, ad.label, nva.value
            FROM node_version_attribute nva
            JOIN attribute_definition ad ON ad.id = nva.attribute_def_id
            WHERE nva.node_version_id = ?
            ORDER BY ad.name
            """, v2Id);

        // Build attribute maps
        Map<String, String> v1AttrMap = new java.util.LinkedHashMap<>();
        Map<String, String> v1LabelMap = new java.util.LinkedHashMap<>();
        for (var r : v1Attrs) {
            String name = r.get("name", String.class);
            v1AttrMap.put(name, r.get("value", String.class));
            v1LabelMap.put(name, Objects.toString(r.get("label", String.class), name));
        }
        Map<String, String> v2AttrMap = new java.util.LinkedHashMap<>();
        Map<String, String> v2LabelMap = new java.util.LinkedHashMap<>();
        for (var r : v2Attrs) {
            String name = r.get("name", String.class);
            v2AttrMap.put(name, r.get("value", String.class));
            v2LabelMap.put(name, Objects.toString(r.get("label", String.class), name));
        }

        // Build diff list — union of all attribute names
        var allAttrNames = new java.util.LinkedHashSet<String>();
        allAttrNames.addAll(v1AttrMap.keySet());
        allAttrNames.addAll(v2AttrMap.keySet());

        var attrDiff = new ArrayList<Map<String, Object>>();
        for (var name : allAttrNames) {
            String oldVal = v1AttrMap.get(name);
            String newVal = v2AttrMap.get(name);
            String label  = v2LabelMap.getOrDefault(name, v1LabelMap.getOrDefault(name, name));
            boolean changed = !Objects.equals(oldVal, newVal);
            attrDiff.add(Map.of(
                "name",    name,
                "label",   label,
                "v1Value", oldVal != null ? oldVal : "",
                "v2Value", newVal != null ? newVal : "",
                "changed", changed
            ));
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
            String status = inV1 && inV2 ? "UNCHANGED" : inV2 ? "ADDED" : "REMOVED";
            var base = inV2 ? v2LinkMap.get(linkId) : v1LinkMap.get(linkId);
            var entry2 = new LinkedHashMap<>(base);
            entry2.put("status", status);
            linkDiff.add(entry2);
        }

        var result = new LinkedHashMap<String, Object>();
        result.put("v1",            buildVersionMeta(v1));
        result.put("v2",            buildVersionMeta(v2));
        result.put("stateChanged",  !Objects.equals(v1State, v2State));
        result.put("attributeDiff", attrDiff);
        result.put("linkDiff",      linkDiff);
        return result;
    }

    private Map<String, Object> buildVersionMeta(Record v) {
        var m = new LinkedHashMap<String, Object>();
        m.put("versionNumber",    v.get("version_number", Integer.class));
        m.put("revision",         Objects.toString(v.get("revision", String.class), ""));
        m.put("iteration",        v.get("iteration", Integer.class));
        m.put("changeType",       Objects.toString(v.get("change_type", String.class), ""));
        m.put("lifecycleStateId", Objects.toString(v.get("lifecycle_state_id", String.class), ""));
        m.put("fingerprint",      Objects.toString(v.get("fingerprint", String.class), ""));
        m.put("createdBy",        Objects.toString(v.get("created_by", String.class), ""));
        m.put("txComment",        Objects.toString(v.get("tx_comment", String.class), ""));
        m.put("committedAt",      Objects.toString(v.get("committed_at"), ""));
        return m;
    }

    /**
     * Retourne tous les liens committed actifs pour un noeud source,
     * dont la version source a un version_number <= maxVersionNum.
     * La source du noeud est dérivée via source_node_version_id → node_version.node_id.
     */
    private List<Map<String, Object>> fetchLinksAtVersion(String nodeId, int maxVersionNum) {
        return dsl.fetch("""
            SELECT nl.id AS link_id, nl.link_type_id, lt.name AS link_type_name, lt.link_policy,
                   nl.target_node_id, n.logical_id AS target_logical_id, nt.name AS target_node_type,
                   nl.pinned_version_id,
                   pv.revision AS pinned_revision, pv.iteration AS pinned_iteration
            FROM node_version_link nl
            JOIN link_type lt        ON lt.id  = nl.link_type_id
            JOIN node n              ON n.id   = nl.target_node_id
            JOIN node_type nt        ON nt.id  = n.node_type_id
            LEFT JOIN node_version pv ON pv.id = nl.pinned_version_id
            JOIN node_version src    ON src.id = nl.source_node_version_id
            JOIN plm_transaction spt ON spt.id = src.tx_id
            WHERE src.node_id = ?
              AND spt.status = 'COMMITTED'
              AND src.version_number <= ?
            ORDER BY lt.name, n.logical_id
            """, nodeId, maxVersionNum)
            .stream().map(r -> {
                var m = new LinkedHashMap<String, Object>();
                m.put("linkId",          r.get("link_id",           String.class));
                m.put("linkTypeName",    r.get("link_type_name",    String.class));
                m.put("linkPolicy",      r.get("link_policy",       String.class));
                m.put("targetNodeId",    r.get("target_node_id",    String.class));
                m.put("targetLogicalId", Objects.toString(r.get("target_logical_id", String.class), ""));
                m.put("targetNodeType",  r.get("target_node_type",  String.class));
                m.put("pinnedVersionId", r.get("pinned_version_id", String.class));
                m.put("pinnedRevision",  r.get("pinned_revision",   String.class));
                m.put("pinnedIteration", r.get("pinned_iteration",  Integer.class));
                return (Map<String, Object>) m;
            }).toList();
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
    @Transactional
    public String checkout(String nodeId, String userId, String txId) {
        permissionService.assertCanWrite(nodeId);
        assertNotFrozen(nodeId);

        // 1. Acquérir le lock sur le noeud (atomique via SELECT FOR UPDATE, sans dépendance tx)
        lockService.tryLock(nodeId, userId);

        // 2. Trouver ou créer une transaction
        if (txId == null) {
            txId = txService.findOpenTransaction(userId);
            if (txId == null) txId = txService.openTransaction(userId);
        }

        // 3. Créer la version OPEN dans la transaction (idempotent)
        String existing = findOpenVersionInTx(nodeId, txId);
        if (existing != null) return existing;
        return versionService.createVersion(nodeId, userId, txId,
            ChangeType.CONTENT, VersionStrategy.ITERATE, null, Map.of(), "Checkout");
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
    @Transactional
    public String modifyNode(String nodeId, String userId, String txId,
                             Map<String, String> attributes, String description,
                             VersionStrategy strategy) {
        permissionService.assertCanWrite(nodeId);
        assertNotFrozen(nodeId);
        lockService.tryLock(nodeId, userId);

        VersionStrategy effective = strategy != null ? strategy : VersionStrategy.ITERATE;

        String existingOpenVersionId = findOpenVersionInTx(nodeId, txId);
        String versionId = existingOpenVersionId != null
            ? versionService.updateVersionAttributes(existingOpenVersionId, attributes, description)
            : versionService.createVersion(nodeId, userId, txId,
                ChangeType.CONTENT, effective, null, attributes, description);

        eventPublisher.nodeUpdated(nodeId, userId);
        return versionId;
    }

    /** Overload without strategy — defaults to ITERATE. */
    @Transactional
    public String modifyNode(String nodeId, String userId, String txId,
                             Map<String, String> attributes, String description) {
        return modifyNode(nodeId, userId, txId, attributes, description, null);
    }

    // ================================================================
    // LIENS — txId OBLIGATOIRE
    // ================================================================

    /**
     * Crée un lien entre deux noeuds dans une transaction.
     * Le noeud source doit être locké dans la transaction.
     *
     * @param txId  transaction PLM ouverte — OBLIGATOIRE
     */
    @Transactional
    public String createLink(String linkTypeId, String sourceNodeId, String targetNodeId,
                             String pinnedVersionId, String userId, String txId,
                             String linkLogicalId) {
        permissionService.assertCanWrite(sourceNodeId);

        Record linkType = dsl.select().from("link_type").where("id = ?", linkTypeId).fetchOne();
        if (linkType == null) throw new IllegalArgumentException("LinkType not found: " + linkTypeId);

        String expectedSource = linkType.get("source_node_type_id", String.class);
        String expectedTarget = linkType.get("target_node_type_id", String.class);
        if (expectedSource != null) validateNodeType(sourceNodeId, expectedSource);
        if (expectedTarget != null) validateNodeType(targetNodeId, expectedTarget);

        // Validate link_logical_id — mandatory
        String pattern = linkType.get("link_logical_id_pattern", String.class);
        String label   = linkType.get("link_logical_id_label",   String.class);
        if (label == null || label.isBlank()) label = "Link ID";
        if (linkLogicalId == null || linkLogicalId.isBlank()) {
            throw new IllegalArgumentException("'" + label + "' is required");
        }
        if (pattern != null && !pattern.isBlank() && !linkLogicalId.matches(pattern)) {
            throw new IllegalArgumentException(
                "'" + label + "' value '" + linkLogicalId + "' does not match pattern: " + pattern);
        }

        Integer maxCard = linkType.get("max_cardinality", Integer.class);
        if (maxCard != null) {
            int existing = dsl.fetchCount(dsl.selectOne().from("node_version_link nl")
                .join("node_version nv_src").on("nv_src.id = nl.source_node_version_id")
                .where("nl.link_type_id = ?", linkTypeId).and("nv_src.node_id = ?", sourceNodeId));
            if (existing >= maxCard)
                throw new IllegalStateException("Max cardinality " + maxCard + " reached");
        }

        // Ensure the source node has an OPEN version in this tx (creating a link is a content change).
        // If already modified in this tx, reuse the existing OPEN version.
        String sourceVersionId = findOpenVersionInTx(sourceNodeId, txId);
        if (sourceVersionId == null) {
            sourceVersionId = versionService.createVersion(sourceNodeId, userId, txId,
                ChangeType.CONTENT, VersionStrategy.ITERATE, null, Map.of(), "Link creation");
        }

        // Lock the source node: validates conflict and writes locked_by / locked_at.
        lockService.tryLock(sourceNodeId, userId);

        String linkId = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO node_version_link
              (ID, LINK_TYPE_ID, SOURCE_NODE_VERSION_ID, TARGET_NODE_ID, PINNED_VERSION_ID,
               LINK_LOGICAL_ID, CREATED_AT, CREATED_BY)
            VALUES (?,?,?,?,?,?,?,?)
            """, linkId, linkTypeId, sourceVersionId, targetNodeId, pinnedVersionId,
            (linkLogicalId != null && !linkLogicalId.isBlank()) ? linkLogicalId : null,
            LocalDateTime.now(), userId);

        log.info("Link created: {}→{} type={} policy={} logicalId={}", sourceNodeId, targetNodeId, linkTypeId,
            pinnedVersionId == null ? "V2M" : "V2V", linkLogicalId);
        return linkId;
    }

    /** Backward-compatible overload for tests that don't supply a linkLogicalId. */
    public String createLink(String linkTypeId, String sourceNodeId, String targetNodeId,
                             String pinnedVersionId, String userId, String txId) {
        // Generate a placeholder logical ID for backward compatibility
        return createLink(linkTypeId, sourceNodeId, targetNodeId, pinnedVersionId, userId, txId,
            "LNK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
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
    public Map<String, Object> buildObjectDescription(String nodeId, String userId, String txId) {
        permissionService.assertCanRead(nodeId);

        Record current = txId != null
            ? versionService.getCurrentVersionForTx(nodeId, txId)
            : versionService.getCurrentVersion(nodeId);

        if (current == null) throw new IllegalStateException("Node has no visible version: " + nodeId);

        String nodeTypeId     = dsl.select().from("node").where("id = ?", nodeId)
                                   .fetchOne("node_type_id", String.class);
        String currentStateId = current.get("lifecycle_state_id", String.class);
        String revision       = current.get("revision",   String.class);
        int    iteration      = current.get("iteration",  Integer.class);
        String versionId      = current.get("id",         String.class);
        String currentTxId    = current.get("tx_id",      String.class);
        String txStatus       = dsl.select().from("plm_transaction").where("id = ?", currentTxId)
                                   .fetchOne("status", String.class);

        String  activeViewId   = permissionService.resolveActiveView(nodeTypeId, currentStateId);
        boolean globalCanWrite = permissionService.canWrite(nodeId);
        LockService.LockInfo lockInfo = lockService.getLockInfo(nodeId);

        // Identity fields — logical_id and external_id are on node (not versioned)
        Record nodeTypeRecord   = dsl.select().from("node_type").where("id = ?", nodeTypeId).fetchOne();
        String lifecycleId      = nodeTypeRecord.get("lifecycle_id",       String.class);
        String logicalIdLabel   = nodeTypeRecord.get("logical_id_label",   String.class);
        String logicalIdPattern = nodeTypeRecord.get("logical_id_pattern", String.class);

        Record nodeRecord  = dsl.select().from("node").where("id = ?", nodeId).fetchOne();
        String logicalId   = nodeRecord.get("logical_id",  String.class);
        String externalId  = nodeRecord.get("external_id", String.class);

        // Valeurs courantes
        Map<String, String> currentValues = new java.util.HashMap<>();
        dsl.select().from("node_version_attribute").where("node_version_id = ?", versionId)
           .fetch().forEach(r -> currentValues.put(
               r.get("attribute_def_id", String.class), r.get("value", String.class)));

        // Attributs résolus avec règle d'état + override de vue
        var attributes = dsl.select().from("attribute_definition ad")
            .where("ad.node_type_id = ?", nodeTypeId)
            .orderBy(DSL.field("ad.display_order")).fetch().stream()
            .map(attr -> {
                String attrId = attr.get("id", String.class);
                Record rule = currentStateId != null
                    ? dsl.select().from("attribute_state_rule")
                         .where("attribute_definition_id = ?", attrId)
                         .and("lifecycle_state_id = ?", currentStateId).fetchOne()
                    : null;

                boolean stateEditable = rule == null || rule.get("editable", Integer.class) == 1;
                boolean stateVisible  = rule == null || rule.get("visible",  Integer.class) == 1;

                PermissionService.AttributeOverride ov = permissionService.applyViewOverride(
                    activeViewId, attrId, stateEditable, stateVisible,
                    attr.get("display_order", Integer.class), attr.get("display_section", String.class));

                if (!ov.visible()) return null;

                boolean requiredByState = rule != null && rule.get("required", Integer.class) == 1;
                boolean requiredGlobal  = attr.get("required", Integer.class) == 1;
                String namingRegex      = attr.get("naming_regex",   String.class);
                String allowedValues    = attr.get("allowed_values", String.class);
                String tooltip          = attr.get("tooltip",        String.class);

                return Map.<String, Object>ofEntries(
                    entry("id",            attrId),
                    entry("name",          attr.get("name",        String.class)),
                    entry("label",         attr.get("label",       String.class)),
                    entry("value",         currentValues.getOrDefault(attrId, "")),
                    entry("type",          attr.get("data_type",   String.class)),
                    entry("widget",        attr.get("widget_type", String.class)),
                    entry("section",       ov.displaySection() != null ? ov.displaySection() : ""),
                    entry("displayOrder",  ov.displayOrder()),
                    entry("editable",      globalCanWrite && ov.editable()),
                    entry("required",      requiredByState || requiredGlobal),
                    entry("namingRegex",   namingRegex   != null ? namingRegex   : ""),
                    entry("allowedValues", allowedValues != null ? allowedValues : ""),
                    entry("tooltip",       tooltip       != null ? tooltip       : "")
                );
            })
            .filter(Objects::nonNull).toList();

        // Actions disponibles — server-driven via le registre d'actions
        List<Map<String, Object>> actions = actionService.resolveActionsForNode(
            nodeId, nodeTypeId, currentStateId, globalCanWrite, lockInfo.locked());

        var result = new java.util.LinkedHashMap<String, Object>();
        result.put("nodeId",        nodeId);
        result.put("technicalId",   nodeId);
        result.put("logicalId",     logicalId     != null ? logicalId     : "");
        result.put("externalId",    externalId    != null ? externalId    : "");
        result.put("logicalIdLabel",   logicalIdLabel   != null ? logicalIdLabel   : "Identifier");
        result.put("logicalIdPattern", logicalIdPattern != null ? logicalIdPattern : "");
        result.put("identity",      logicalId != null && !logicalId.isBlank()
                                        ? logicalId
                                        : revision + "." + iteration);
        result.put("revision",    revision);
        result.put("iteration",   iteration);
        result.put("state",       currentStateId != null ? currentStateId : "");
        result.put("txStatus",    txStatus != null ? txStatus : "COMMITTED");
        result.put("canWrite",    globalCanWrite);
        result.put("lifecycleId", lifecycleId != null ? lifecycleId : "");
        // Look up the OPEN version's txId separately — lock is tx-agnostic on node table.
        String lockTxId = lockInfo.locked()
            ? dsl.select(DSL.field("nv.tx_id")).from("node_version nv")
                 .join("plm_transaction pt").on("pt.id = nv.tx_id")
                 .where("nv.node_id = ?", nodeId).and("pt.status = 'OPEN'")
                 .limit(1).fetchOne(DSL.field("tx_id"), String.class)
            : null;
        result.put("lock",        Map.of(
                                      "locked",    lockInfo.locked(),
                                      "lockedBy",  lockInfo.lockedBy() != null ? lockInfo.lockedBy() : "",
                                      "txId",      lockTxId != null ? lockTxId : ""
                                  ));
        result.put("nodeTypeId",       nodeTypeId);
        result.put("currentVersionId", versionId);
        result.put("attributes",       attributes);
        result.put("actions",          actions);
        return result;
    }

    /** Returns the current lifecycle_state_id for a node, considering an open tx if provided. */
    public String getCurrentStateId(String nodeId, String txId) {
        Record current = txId != null
            ? versionService.getCurrentVersionForTx(nodeId, txId)
            : versionService.getCurrentVersion(nodeId);
        return current != null ? current.get("lifecycle_state_id", String.class) : null;
    }

    // ================================================================
    // LIENS — lecture (pas de txId requis)
    // ================================================================

    /**
     * Retourne les liens sortants du noeud (BOM / enfants).
     * Pour chaque lien, résout la version courante COMMITTED du noeud cible.
     */
    public List<Map<String, Object>> getChildLinks(String nodeId) {
        var ctx = PlmSecurityContext.get();
        String currentUserId = ctx != null ? ctx.getUserId() : "";
        boolean isAdmin      = ctx != null && ctx.isAdmin();
        return dsl.fetch("""
            SELECT nl.id AS link_id, lt.name AS link_type_name, lt.link_policy,
                   nl.link_logical_id, lt.link_logical_id_label,
                   n.id AS target_node_id, nt.name AS target_node_type,
                   n.logical_id AS target_logical_id,
                   nv.revision, nv.iteration, nv.lifecycle_state_id
            FROM node_version_link nl
            JOIN link_type lt        ON lt.id     = nl.link_type_id
            JOIN node_version nv_src ON nv_src.id = nl.source_node_version_id
            JOIN plm_transaction pt_src ON pt_src.id = nv_src.tx_id
            JOIN node n              ON n.id      = nl.target_node_id
            JOIN node_type nt        ON nt.id     = n.node_type_id
            JOIN node_version nv     ON nv.node_id = n.id
            JOIN plm_transaction pt  ON pt.id     = nv.tx_id
            WHERE nv_src.node_id = ?
              AND (pt_src.status = 'COMMITTED'
                   OR (pt_src.status = 'OPEN' AND (pt_src.owner_id = ? OR ? = 'true')))
              AND pt.status = 'COMMITTED'
              AND nv.version_number = (
                SELECT MAX(nv2.version_number) FROM node_version nv2
                JOIN plm_transaction pt2 ON pt2.id = nv2.tx_id
                WHERE nv2.node_id = n.id AND pt2.status = 'COMMITTED')
            ORDER BY lt.name, n.logical_id
            """, nodeId, currentUserId, String.valueOf(isAdmin))
            .stream().map(r -> {
                Map<String, Object> m = new java.util.LinkedHashMap<>();
                m.put("linkId",              r.get("link_id",              String.class));
                m.put("linkTypeName",        r.get("link_type_name",        String.class));
                m.put("linkPolicy",          r.get("link_policy",           String.class));
                m.put("linkLogicalId",       Objects.toString(r.get("link_logical_id",       String.class), ""));
                m.put("linkLogicalIdLabel",  Objects.toString(r.get("link_logical_id_label", String.class), "Link ID"));
                m.put("targetNodeId",        r.get("target_node_id",        String.class));
                m.put("targetNodeType",      r.get("target_node_type",      String.class));
                m.put("targetLogicalId",     Objects.toString(r.get("target_logical_id",    String.class), ""));
                m.put("targetRevision",      Objects.toString(r.get("revision",             String.class), ""));
                m.put("targetIteration",     Objects.toString(r.get("iteration",            Integer.class), ""));
                m.put("targetState",         Objects.toString(r.get("lifecycle_state_id",   String.class), ""));
                return m;
            }).toList();
    }

    /**
     * Retourne les liens entrants vers ce noeud (Where Used / parents).
     * Pour chaque lien, résout la version courante COMMITTED du noeud source.
     */
    public List<Map<String, Object>> getParentLinks(String nodeId) {
        var ctx = PlmSecurityContext.get();
        String currentUserId = ctx != null ? ctx.getUserId() : "";
        boolean isAdmin      = ctx != null && ctx.isAdmin();
        return dsl.fetch("""
            SELECT nl.id AS link_id, lt.name AS link_type_name, lt.link_policy,
                   nl.link_logical_id, lt.link_logical_id_label,
                   n.id AS source_node_id, nt.name AS source_node_type,
                   n.logical_id AS source_logical_id,
                   nv.revision, nv.iteration, nv.lifecycle_state_id
            FROM node_version_link nl
            JOIN link_type lt        ON lt.id     = nl.link_type_id
            JOIN node_version nv_src ON nv_src.id = nl.source_node_version_id
            JOIN plm_transaction pt_src ON pt_src.id = nv_src.tx_id
            JOIN node n              ON n.id      = nv_src.node_id
            JOIN node_type nt        ON nt.id     = n.node_type_id
            JOIN node_version nv     ON nv.node_id = n.id
            JOIN plm_transaction pt  ON pt.id     = nv.tx_id
            WHERE nl.target_node_id = ?
              AND (pt_src.status = 'COMMITTED'
                   OR (pt_src.status = 'OPEN' AND (pt_src.owner_id = ? OR ? = 'true')))
              AND pt.status = 'COMMITTED'
              AND nv.version_number = (
                SELECT MAX(nv2.version_number) FROM node_version nv2
                JOIN plm_transaction pt2 ON pt2.id = nv2.tx_id
                WHERE nv2.node_id = n.id AND pt2.status = 'COMMITTED')
            ORDER BY lt.name, n.logical_id
            """, nodeId, currentUserId, String.valueOf(isAdmin))
            .stream().map(r -> {
                Map<String, Object> m = new java.util.LinkedHashMap<>();
                m.put("linkId",              r.get("link_id",              String.class));
                m.put("linkTypeName",        r.get("link_type_name",        String.class));
                m.put("linkPolicy",          r.get("link_policy",           String.class));
                m.put("linkLogicalId",       Objects.toString(r.get("link_logical_id",       String.class), ""));
                m.put("linkLogicalIdLabel",  Objects.toString(r.get("link_logical_id_label", String.class), "Link ID"));
                m.put("sourceNodeId",        r.get("source_node_id",        String.class));
                m.put("sourceNodeType",      r.get("source_node_type",      String.class));
                m.put("sourceLogicalId",     Objects.toString(r.get("source_logical_id",    String.class), ""));
                m.put("sourceRevision",      Objects.toString(r.get("revision",             String.class), ""));
                m.put("sourceIteration",     Objects.toString(r.get("iteration",            Integer.class), ""));
                m.put("sourceState",         Objects.toString(r.get("lifecycle_state_id",   String.class), ""));
                return m;
            }).toList();
    }

    /**
     * Deletes a link by ID. The source node must be checked-out in the given transaction.
     */
    @Transactional
    public void deleteLink(String linkId, String userId, String txId) {
        // Resolve source node from the link
        String sourceNodeId = dsl.select(DSL.field("nl.source_node_id"))
            .from("node_version_link nl")
            .join("node_version nv").on("nv.id = nl.source_node_version_id")
            .where("nl.id = ?", linkId)
            .fetchOne(DSL.field("source_node_id"), String.class);

        // Try legacy direct source column
        if (sourceNodeId == null) {
            // Try via source_node_version_id → node_id
            sourceNodeId = dsl.select(DSL.field("nv.node_id"))
                .from("node_version_link nl")
                .join("node_version nv").on("nv.id = nl.source_node_version_id")
                .where("nl.id = ?", linkId)
                .fetchOne(DSL.field("node_id"), String.class);
        }
        if (sourceNodeId == null) throw new IllegalArgumentException("Link not found: " + linkId);

        permissionService.assertCanWrite(sourceNodeId);
        lockService.tryLock(sourceNodeId, userId);

        dsl.execute("DELETE FROM node_version_link WHERE id = ?", linkId);
        log.info("Link {} deleted by {}", linkId, userId);
    }

    /**
     * Updates the link_logical_id of an existing link. Source node must be checked out.
     */
    @Transactional
    public void updateLinkLogicalId(String linkId, String newLogicalId, String userId, String txId) {
        String sourceNodeId = dsl.select(DSL.field("nv.node_id"))
            .from("node_version_link nl")
            .join("node_version nv").on("nv.id = nl.source_node_version_id")
            .where("nl.id = ?", linkId)
            .fetchOne(DSL.field("node_id"), String.class);
        if (sourceNodeId == null) throw new IllegalArgumentException("Link not found: " + linkId);

        permissionService.assertCanWrite(sourceNodeId);
        lockService.tryLock(sourceNodeId, userId);

        dsl.execute("UPDATE node_version_link SET link_logical_id = ? WHERE id = ?", newLogicalId, linkId);
        log.info("Link {} logical ID updated to {} by {}", linkId, newLogicalId, userId);
    }

    // ================================================================
    // Helpers
    // ================================================================

    /**
     * Retourne l'id de la version OPEN de ce noeud dans cette transaction, ou null.
     */
    private String findOpenVersionInTx(String nodeId, String txId) {
        // All versions belonging to an OPEN transaction are by definition "open"
        return dsl.select().from("node_version")
            .where("node_id = ?", nodeId)
            .and("tx_id = ?", txId)
            .orderBy(DSL.field("version_number").desc())
            .limit(1)
            .fetchOne("id", String.class);
    }

    private void validateNodeType(String nodeId, String expectedTypeId) {
        String actual = dsl.select().from("node").where("id = ?", nodeId)
                           .fetchOne("node_type_id", String.class);
        if (!expectedTypeId.equals(actual))
            throw new IllegalArgumentException("Node " + nodeId + " wrong type, expected " + expectedTypeId);
    }

    /**
     * Throws FrozenStateException if the node's current lifecycle state has is_frozen = 1.
     * A FROZEN state prohibits content modifications (checkout / modifyNode).
     * Lifecycle transitions and signatures are still allowed.
     */
    private void assertNotFrozen(String nodeId) {
        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) return;
        String stateId = current.get("lifecycle_state_id", String.class);
        if (stateId == null) return;
        Integer frozen = dsl.select().from("lifecycle_state").where("id = ?", stateId)
            .fetchOne("is_frozen", Integer.class);
        if (frozen != null && frozen == 1) {
            throw new FrozenStateException(nodeId, stateId);
        }
    }

    public static class FrozenStateException extends com.plm.domain.exception.PlmFunctionalException {
        public FrozenStateException(String nodeId, String stateId) {
            super("Node " + nodeId + " is in a frozen state (" + stateId
                + ") — content modifications are not allowed", 422);
        }
    }
}
