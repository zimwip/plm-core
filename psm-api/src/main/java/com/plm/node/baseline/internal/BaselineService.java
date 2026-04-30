package com.plm.node.baseline.internal;
import com.plm.node.NodeService;
import com.plm.node.version.internal.VersionService;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.LinkTypeConfig;

import com.plm.platform.authz.PlmPermission;
import com.plm.shared.metadata.Metadata;
import com.plm.shared.metadata.MetadataService;
import com.plm.shared.event.PlmEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Gestion des baselines PLM.
 *
 * Principe :
 *  - Une baseline est une photo cohérente de la grappe à un instant T
 *  - Prérequis : le noeud racine doit être dans un état Frozen
 *    (garantit l'absence de modifications concurrentes pendant le tag)
 *  - Résolution eager des liens VERSION_TO_MASTER au moment du tag
 *    → fiabilité garantie à long terme
 *  - Les liens VERSION_TO_VERSION sont auto-documentés (pas d'entrée baseline)
 *
 * Stratégie anti race-condition :
 *  Le Frozen cascade (appliqué avant la baseline) lock toute la grappe.
 *  Une fois Frozen, aucune nouvelle version ne peut être créée sur les noeuds enfants.
 *  Le tag de baseline est donc toujours cohérent.
 */
@Metadata(key = "frozen", target = "LIFECYCLE_STATE",
    description = "Prerequisite for baseline creation")
@Slf4j
@Service
@RequiredArgsConstructor
public class BaselineService {

    private final DSLContext        dsl;
    private final ConfigCache       configCache;
    private final VersionService    versionService;
    private final PlmEventPublisher eventPublisher;
    private final MetadataService   metadataService;

    /**
     * Crée une baseline sur un noeud racine.
     *
     * @param rootNodeId  noeud racine de la grappe
     * @param name        nom de la baseline (ex: "BL_2026_Q2")
     * @param description description optionnelle
     * @param userId      créateur
     */
    @PlmPermission("MANAGE_BASELINES")
    @Transactional
    public String createBaseline(String rootNodeId, String name, String description, String userId) {

        // 1. Vérifier que le noeud racine est Frozen
        assertNodeIsFrozen(rootNodeId);

        // 2. Créer l'entête baseline
        String baselineId = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO baseline (ID, NAME, DESCRIPTION, CREATED_AT, CREATED_BY)
            VALUES (?,?,?,?,?)
            """,
            baselineId, name, description, LocalDateTime.now(), userId
        );

        // 3. Parcourir la grappe et résoudre tous les liens VERSION_TO_MASTER
        resolveAndRecord(baselineId, rootNodeId);

        long entryCount = dsl.fetchCount(
            dsl.selectOne().from("baseline_entry").where("baseline_id = ?", baselineId)
        );

        eventPublisher.baselineCreated(baselineId, name, userId);
        log.info("Baseline created: id={} name='{}' entries={} user={}", baselineId, name, entryCount, userId);
        return baselineId;
    }

    /**
     * Retourne le contenu complet d'une baseline :
     * pour chaque lien VERSION_TO_MASTER, la version résolue au moment du tag.
     */
    public List<Record> getBaselineContent(String baselineId) {
        // Resolved key has the form 'logical_id@versionNumber'. Splitting it lets us
        // join back to the SELF node store. Non-SELF entries (future) would need
        // resolver dispatch — for now we only emit SELF entries from resolveAndRecord.
        return dsl.fetch("""
            SELECT be.*, nl.link_type_id, nl.target_source_id, nl.target_type, nl.target_key,
                   n.id AS node_id, n.logical_id, nv.id AS node_version_id, nv.version_number,
                   nv.revision, nv.iteration, nv.lifecycle_state_id
            FROM baseline_entry be
            JOIN node_version_link nl ON nl.id = be.node_link_id
            LEFT JOIN node n ON nl.target_source_id = 'SELF'
                AND n.logical_id = SUBSTR(be.resolved_key, 1, POSITION('@' IN be.resolved_key) - 1)
                AND n.node_type_id = nl.target_type
            LEFT JOIN node_version nv ON nv.node_id = n.id
                AND nv.version_number = CAST(SUBSTR(be.resolved_key, POSITION('@' IN be.resolved_key) + 1) AS INT)
            WHERE be.baseline_id = ?
            ORDER BY n.id, nv.version_number
            """, baselineId);
    }

    /**
     * Compare deux baselines : retourne les noeuds dont la version a changé entre les deux.
     */
    public List<Map<String, Object>> compareBaselines(String baselineIdA, String baselineIdB) {
        // Résoudre les versions de chaque baseline indexées par node_link_id
        Map<String, String> versionsA = resolveBaselineVersions(baselineIdA);
        Map<String, String> versionsB = resolveBaselineVersions(baselineIdB);

        List<Map<String, Object>> diffs = new java.util.ArrayList<>();

        // Liens présents dans A
        for (Map.Entry<String, String> entry : versionsA.entrySet()) {
            String linkId   = entry.getKey();
            String versionA = entry.getValue();
            String versionB = versionsB.get(linkId);

            if (versionB == null) {
                diffs.add(Map.of("linkId", linkId, "status", "REMOVED", "versionA", versionA));
            } else if (!versionA.equals(versionB)) {
                diffs.add(Map.of("linkId", linkId, "status", "CHANGED",
                    "versionA", versionA, "versionB", versionB));
            }
        }

        // Liens présents dans B mais pas dans A (ajoutés)
        for (String linkId : versionsB.keySet()) {
            if (!versionsA.containsKey(linkId)) {
                diffs.add(Map.of("linkId", linkId, "status", "ADDED", "versionB", versionsB.get(linkId)));
            }
        }

        return diffs;
    }

    /**
     * Liste toutes les baselines avec leur métadonnée (backward compat — page 0, size 50).
     */
    public NodeService.PagedResult<Record> listBaselines() {
        return listBaselines(0, 50);
    }

    /**
     * Liste les baselines avec pagination.
     */
    public NodeService.PagedResult<Record> listBaselines(int page, int size) {
        int total = dsl.fetchCount(dsl.selectOne().from("baseline"));
        List<Record> items = dsl.select().from("baseline")
                  .orderBy(DSL.field("created_at").desc())
                  .limit(size)
                  .offset(page * size)
                  .fetch();
        return new NodeService.PagedResult<>(items, page, size, total);
    }

    // ================================================================
    // Helpers privés
    // ================================================================

    /**
     * Parcourt récursivement la grappe depuis un noeud et enregistre
     * une entrée baseline pour chaque lien VERSION_TO_MASTER trouvé.
     */
    private void resolveAndRecord(String baselineId, String parentNodeId) {
        // Walk SELF V2M children (target_source_id='SELF' and key without '@version').
        // Non-SELF links don't participate in baseline traversal — files/external systems
        // are pinned at write time by their resolver. Their baseline_entry row stores
        // target_key verbatim in resolved_key.
        var links = dsl.fetch("""
            SELECT nl.id AS nl_id, nl.link_type_id, nl.target_source_id, nl.target_type, nl.target_key,
                   n.id AS target_node_id
            FROM node_version_link nl
            JOIN node_version nv_src ON nv_src.id = nl.source_node_version_id
            LEFT JOIN node n ON nl.target_source_id = 'SELF'
                AND n.logical_id = CASE
                    WHEN POSITION('@' IN nl.target_key) > 0
                        THEN SUBSTR(nl.target_key, 1, POSITION('@' IN nl.target_key) - 1)
                    ELSE nl.target_key
                  END
                AND n.node_type_id = nl.target_type
            WHERE nv_src.node_id = ?
            """, parentNodeId);

        for (Record link : links) {
            String linkId    = link.get("nl_id", String.class);
            String linkTypeId = link.get("link_type_id", String.class);
            String targetSource = link.get("target_source_id", String.class);
            String targetKey = link.get("target_key", String.class);
            String policy    = configCache.getLinkType(linkTypeId)
                .map(LinkTypeConfig::linkPolicy).orElse(null);

            if ("SELF".equals(targetSource) && "VERSION_TO_MASTER".equals(policy)
                && targetKey.indexOf('@') < 0) {
                String targetId = link.get("target_node_id", String.class);
                if (targetId == null) {
                    log.warn("Baseline: cannot resolve SELF target {}/{} — skipping",
                        link.get("target_type", String.class), targetKey);
                    continue;
                }
                Record currentVersion = versionService.getCurrentVersion(targetId);
                if (currentVersion == null) {
                    log.warn("No version found for node {} during baseline, skipping", targetId);
                    continue;
                }
                Integer versionNumber = currentVersion.get("version_number", Integer.class);
                String resolvedKey = targetKey + "@" + versionNumber;
                dsl.execute("""
                    INSERT INTO baseline_entry (ID, BASELINE_ID, NODE_LINK_ID, RESOLVED_KEY)
                    VALUES (?,?,?,?)
                    """,
                    UUID.randomUUID().toString(), baselineId, linkId, resolvedKey);
                log.debug("Baseline entry: link={} resolvedKey={}", linkId, resolvedKey);
                resolveAndRecord(baselineId, targetId);
            } else {
                // Already pinned (V2V or non-SELF) — record verbatim, no traversal.
                dsl.execute("""
                    INSERT INTO baseline_entry (ID, BASELINE_ID, NODE_LINK_ID, RESOLVED_KEY)
                    VALUES (?,?,?,?)
                    """,
                    UUID.randomUUID().toString(), baselineId, linkId, targetKey);
            }
        }
    }

    /**
     * Vérifie que le noeud est dans un état Frozen avant de créer la baseline.
     */
    private void assertNodeIsFrozen(String nodeId) {
        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) {
            throw new IllegalStateException("Node has no version: " + nodeId);
        }

        String stateId = current.get("lifecycle_state_id", String.class);
        if (stateId == null) {
            throw new IllegalStateException("Node has no lifecycle state: " + nodeId);
        }

        if (!metadataService.isTrue("LIFECYCLE_STATE", stateId, "frozen")) {
            throw new IllegalStateException(
                "Node " + nodeId + " must be in Frozen state before creating a baseline. " +
                "Apply CASCADE_FROZEN transition first."
            );
        }
    }

    private Map<String, String> resolveBaselineVersions(String baselineId) {
        Map<String, String> result = new java.util.HashMap<>();
        dsl.select().from("baseline_entry")
           .where("baseline_id = ?", baselineId)
           .fetch()
           .forEach(r -> result.put(
               r.get("node_link_id", String.class),
               r.get("resolved_key", String.class)
           ));
        return result;
    }
}
