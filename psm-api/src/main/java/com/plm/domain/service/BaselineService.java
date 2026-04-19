package com.plm.domain.service;

import com.plm.domain.action.PlmAction;
import com.plm.domain.metadata.Metadata;
import com.plm.domain.metadata.MetadataService;
import com.plm.infrastructure.PlmEventPublisher;
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
    @PlmAction("MANAGE_BASELINES")
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
        return dsl.select()
            .from("baseline_entry be")
            .join("node_version_link nl").on("be.node_link_id = nl.id")
            .join("node_version nv").on("be.resolved_version_id = nv.id")
            .join("node n").on("nv.node_id = n.id")
            .where("be.baseline_id = ?", baselineId)
            .orderBy(DSL.field("n.id"), DSL.field("nv.version_number"))
            .fetch();
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
        var links = dsl.select(
                DSL.field("nl.id").as("nl_id"),
                DSL.field("lt.link_policy").as("lt_link_policy"),
                DSL.field("nl.target_node_id").as("nl_target_node_id"))
            .from("node_version_link nl")
            .join("link_type lt").on("nl.link_type_id = lt.id")
            .join("node_version nv_src").on("nv_src.id = nl.source_node_version_id")
            .where("nv_src.node_id = ?", parentNodeId)
            .fetch();

        for (Record link : links) {
            String linkId    = link.get("nl_id", String.class);
            String policy    = link.get("lt_link_policy", String.class);
            String targetId  = link.get("nl_target_node_id", String.class);

            if ("VERSION_TO_MASTER".equals(policy)) {
                // Résoudre la version courante de la cible
                Record currentVersion = versionService.getCurrentVersion(targetId);
                if (currentVersion == null) {
                    log.warn("No version found for node {} during baseline, skipping", targetId);
                    continue;
                }

                String resolvedVersionId = currentVersion.get("id", String.class);

                // Enregistrer l'entrée baseline
                dsl.execute("""
                    INSERT INTO baseline_entry (ID, BASELINE_ID, NODE_LINK_ID, RESOLVED_VERSION_ID)
                    VALUES (?,?,?,?)
                    """,
                    UUID.randomUUID().toString(), baselineId, linkId, resolvedVersionId
                );

                log.debug("Baseline entry: link={} resolvedVersion={}", linkId, resolvedVersionId);

                // Récursion sur l'enfant
                resolveAndRecord(baselineId, targetId);

            }
            // VERSION_TO_VERSION : rien à faire, le lien pointe déjà une version figée
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
               r.get("resolved_version_id", String.class)
           ));
        return result;
    }
}
