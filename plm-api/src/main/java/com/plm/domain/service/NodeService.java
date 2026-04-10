package com.plm.domain.service;

import com.plm.domain.model.Enums.ChangeType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import static java.util.Map.entry;
import java.util.Objects;
import java.util.UUID;

/**
 * CRUD sur les noeuds PLM.
 *
 * Le txId est un paramètre de première classe pour toutes les opérations d'authoring.
 * L'appelant (controller ou test) est responsable d'ouvrir la transaction avant
 * d'appeler ces méthodes, et de la commiter/annuler après.
 *
 * Opérations qui nécessitent un txId : modifyNode, createLink
 * Opérations sans txId (pas d'authoring) : createNode, buildObjectDescription
 *
 * createNode est un cas particulier : la version initiale est directement COMMITTED
 * (création = acte atomique, pas de review nécessaire).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NodeService {

    private final DSLContext         dsl;
    private final LockService        lockService;
    private final VersionService     versionService;
    private final PermissionService  permissionService;
    private final ValidationService  validationService;

    // ================================================================
    // CRÉATION (pas de txId — version initiale directement COMMITTED)
    // ================================================================

    @Transactional
    public String createNode(String nodeTypeId, String userId, Map<String, String> attributes) {
        Record nodeType = dsl.select().from("node_type").where("id = ?", nodeTypeId).fetchOne();
        if (nodeType == null) throw new IllegalArgumentException("NodeType not found: " + nodeTypeId);

        String nodeId = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO node (ID, NODE_TYPE_ID, CREATED_AT, CREATED_BY) VALUES (?,?,?,?)",
            nodeId, nodeTypeId, LocalDateTime.now(), userId);

        String lifecycleId  = nodeType.get("lifecycle_id", String.class);
        String initialState = null;
        if (lifecycleId != null) {
            initialState = dsl.select().from("lifecycle_state")
                .where("lifecycle_id = ?", lifecycleId).and("is_initial = 1")
                .fetchOne("id", String.class);
        }

        // Version initiale : TX_ID=NULL, TX_STATUS=COMMITTED → visible par tous immédiatement
        String versionId = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO node_version
              (ID, NODE_ID, VERSION_NUMBER, REVISION, ITERATION, LIFECYCLE_STATE_ID,
               CHANGE_TYPE, CHANGE_DESCRIPTION, TX_ID, TX_STATUS, CREATED_AT, CREATED_BY)
            VALUES (?, ?, 1, 'A', 1, ?, 'CONTENT', 'Initial creation', NULL, 'COMMITTED', ?, ?)
            """, versionId, nodeId, initialState, LocalDateTime.now(), userId);

        for (Map.Entry<String, String> e : attributes.entrySet()) {
            dsl.execute("INSERT INTO node_version_attribute (ID, NODE_VERSION_ID, ATTRIBUTE_DEF_ID, VALUE) VALUES (?,?,?,?)",
                UUID.randomUUID().toString(), versionId, e.getKey(), e.getValue());
        }

        if (initialState != null) {
            List<String> violations = validationService.collectContentViolations(nodeId, initialState, attributes);
            if (!violations.isEmpty()) {
                throw new ValidationService.ValidationException(violations);
            }
        }

        log.info("Node created: id={} type={} user={}", nodeId, nodeTypeId, userId);
        return nodeId;
    }

    // ================================================================
    // LISTE — dernière version COMMITTED par noeud
    // ================================================================

    public List<Record> listNodes() {
        return dsl.fetch("""
            SELECT n.id, n.node_type_id, nt.name AS node_type_name,
                   nv.lifecycle_state_id, nv.revision, nv.iteration, nv.version_number,
                   n.created_at, n.created_by
            FROM node n
            JOIN node_type nt ON nt.id = n.node_type_id
            JOIN node_version nv ON nv.node_id = n.id
            WHERE nv.tx_status = 'COMMITTED'
              AND nv.version_number = (
                SELECT MAX(nv2.version_number) FROM node_version nv2
                WHERE nv2.node_id = n.id AND nv2.tx_status = 'COMMITTED')
            ORDER BY n.created_at DESC
            """);
    }

    // ================================================================
    // HISTORIQUE — toutes les versions d'un noeud
    // ================================================================

    public List<Record> getVersionHistory(String nodeId) {
        return dsl.fetch("""
            SELECT nv.id, nv.version_number, nv.revision, nv.iteration,
                   nv.lifecycle_state_id, nv.change_type, nv.change_description,
                   nv.created_by,
                   nv.previous_version_id,
                   pt.commit_comment AS tx_comment,
                   pt.owner_id       AS tx_owner
            FROM node_version nv
            LEFT JOIN plm_transaction pt ON pt.id = nv.tx_id
            WHERE nv.node_id = ?
              AND (nv.tx_status = 'COMMITTED' OR nv.tx_status IS NULL)
            ORDER BY nv.version_number
            """, nodeId);
    }

    // ================================================================
    // CHECKOUT — txId OBLIGATOIRE
    // ================================================================

    /**
     * Ouvre le noeud pour édition dans une transaction :
     *   1. Vérifie can_write
     *   2. Acquiert le lock (checkin) — idempotent si déjà locké par cette tx
     *   3. Crée une version OPEN avec les attributs courants (copie de la version précédente)
     *
     * Idempotent : si le noeud est déjà checké-out dans cette tx, retourne la version existante.
     *
     * @param txId  transaction PLM ouverte — OBLIGATOIRE
     */
    @Transactional
    public String checkoutNode(String nodeId, String userId, String txId) {
        permissionService.assertCanWrite(nodeId);

        // Idempotent : déjà checké-out dans cette tx
        String existing = findOpenVersionInTx(nodeId, txId);
        if (existing != null) {
            log.debug("Node {} already checked out in tx {} — idempotent", nodeId, txId);
            return existing;
        }

        lockService.checkin(nodeId, userId, txId);
        // Copie exacte de la version courante (aucun attribut modifié)
        return versionService.createVersion(nodeId, userId, txId,
            ChangeType.CONTENT, null, Map.of(), "Checkout");
    }

    // ================================================================
    // MODIFICATION — txId OBLIGATOIRE
    // ================================================================

    /**
     * Modifie le contenu d'un noeud dans le contexte d'une transaction explicite.
     *
     * Si le noeud est déjà checké-out dans cette tx (version OPEN existante),
     * met à jour les attributs en place plutôt que de créer une nouvelle version.
     *
     * Sinon, acquiert le lock et crée une nouvelle version OPEN.
     *
     * @param txId  transaction PLM ouverte — OBLIGATOIRE
     */
    @Transactional
    public String modifyNode(String nodeId, String userId, String txId,
                             Map<String, String> attributes, String description) {
        permissionService.assertCanWrite(nodeId);
        lockService.checkin(nodeId, userId, txId);  // idempotent si déjà locké

        String existingOpenVersionId = findOpenVersionInTx(nodeId, txId);
        if (existingOpenVersionId != null) {
            // Mise à jour en place de la version OPEN (déjà checké-out)
            return versionService.updateVersionAttributes(existingOpenVersionId, attributes, description);
        }

        return versionService.createVersion(nodeId, userId, txId,
            ChangeType.CONTENT, null, attributes, description);
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
                             String pinnedVersionId, String userId, String txId) {
        permissionService.assertCanWrite(sourceNodeId);
        lockService.checkin(sourceNodeId, userId, txId);

        Record linkType = dsl.select().from("link_type").where("id = ?", linkTypeId).fetchOne();
        if (linkType == null) throw new IllegalArgumentException("LinkType not found: " + linkTypeId);

        String expectedSource = linkType.get("source_node_type_id", String.class);
        String expectedTarget = linkType.get("target_node_type_id", String.class);
        if (expectedSource != null) validateNodeType(sourceNodeId, expectedSource);
        if (expectedTarget != null) validateNodeType(targetNodeId, expectedTarget);

        Integer maxCard = linkType.get("max_cardinality", Integer.class);
        if (maxCard != null) {
            int existing = dsl.fetchCount(dsl.selectOne().from("node_link")
                .where("link_type_id = ?", linkTypeId).and("source_node_id = ?", sourceNodeId));
            if (existing >= maxCard)
                throw new IllegalStateException("Max cardinality " + maxCard + " reached");
        }

        String linkId = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO node_link
              (ID, LINK_TYPE_ID, SOURCE_NODE_ID, TARGET_NODE_ID, PINNED_VERSION_ID, CREATED_AT, CREATED_BY)
            VALUES (?,?,?,?,?,?,?)
            """, linkId, linkTypeId, sourceNodeId, targetNodeId, pinnedVersionId,
            LocalDateTime.now(), userId);

        log.info("Link created: {}→{} type={} policy={}", sourceNodeId, targetNodeId, linkTypeId,
            pinnedVersionId == null ? "V2M" : "V2V");
        return linkId;
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
        String txStatus       = current.get("tx_status",  String.class);

        String  activeViewId   = permissionService.resolveActiveView(nodeTypeId, currentStateId);
        boolean globalCanWrite = permissionService.canWrite(nodeId);
        LockService.LockInfo lockInfo = lockService.getLockInfo(nodeId);

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

                return Map.<String, Object>of(
                    "id",           attrId,
                    "name",         attr.get("name",        String.class),
                    "label",        attr.get("label",       String.class),
                    "value",        currentValues.getOrDefault(attrId, ""),
                    "type",         attr.get("data_type",   String.class),
                    "widget",       attr.get("widget_type", String.class),
                    "section",      ov.displaySection() != null ? ov.displaySection() : "",
                    "displayOrder", ov.displayOrder(),
                    "editable",     globalCanWrite && ov.editable()
                );
            })
            .filter(Objects::nonNull).toList();

        // Actions disponibles — server-driven : le frontend ne hardcode rien
        // Chaque action a un "type" qui pilote le rendu côté frontend.
        List<Map<String, Object>> actions = new java.util.ArrayList<>();

        // 1. Transitions lifecycle filtrées par permission → type TRANSITION
        dsl.select().from("lifecycle_transition")
            .where("from_state_id = ?", currentStateId).fetch().stream()
            .filter(t -> {
                try { permissionService.assertCanTransition(t.get("id", String.class)); return true; }
                catch (PermissionService.AccessDeniedException e) { return false; }
            })
            .map(t -> Map.<String, Object>of(
                "id",   t.get("id",   String.class),
                "name", t.get("name", String.class),
                "type", "TRANSITION"
            ))
            .forEach(actions::add);

        // 2. Signature → type SIGN (seulement si l'utilisateur a can_sign sur ce noeud)
        if (permissionService.canSign(nodeId)) {
            actions.add(Map.<String, Object>of(
                "id",       "sign",
                "type",     "SIGN",
                "name",     "Sign",
                "meanings", List.of("Reviewed", "Approved", "Verified", "Acknowledged")
            ));
        }

        return Map.of(
            "nodeId",      nodeId,
            "identity",    revision + "." + iteration,
            "revision",    revision,
            "iteration",   iteration,
            "state",       currentStateId != null ? currentStateId : "",
            "txStatus",    txStatus != null ? txStatus : "COMMITTED",
            "canWrite",    globalCanWrite,
            "lock",        Map.of(
                               "locked",    lockInfo.locked(),
                               "lockedBy",  lockInfo.lockedBy() != null ? lockInfo.lockedBy() : "",
                               "txId",      lockInfo.txId() != null ? lockInfo.txId() : ""
                           ),
            "attributes",  attributes,
            "actions",     actions
        );
    }

    // ================================================================
    // Helpers
    // ================================================================

    /**
     * Retourne l'id de la version OPEN de ce noeud dans cette transaction, ou null.
     */
    private String findOpenVersionInTx(String nodeId, String txId) {
        return dsl.select().from("node_version")
            .where("node_id = ?", nodeId)
            .and("tx_id = ?", txId)
            .and("tx_status = 'OPEN'")
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
}
