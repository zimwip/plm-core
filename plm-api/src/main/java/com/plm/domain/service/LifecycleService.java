package com.plm.domain.service;

import com.plm.domain.model.Enums.ChangeType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Application des transitions de lifecycle.
 *
 * txId obligatoire pour toute transition (comme toute opération d'authoring).
 * La transition est une modification de type LIFECYCLE — elle ne change pas
 * revision.iteration mais crée une nouvelle version technique pour la traçabilité.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LifecycleService {

    private final DSLContext     dsl;
    private final VersionService versionService;
    private final LockService    lockService;

    /**
     * Applique une transition de lifecycle.
     *
     * @param txId  transaction PLM ouverte — OBLIGATOIRE
     */
    @Transactional
    public String applyTransition(String nodeId, String transitionId, String userId, String txId) {
        Record transition = dsl.select().from("lifecycle_transition")
            .where("id = ?", transitionId).fetchOne();
        if (transition == null) throw new IllegalArgumentException("Transition not found: " + transitionId);

        String fromStateId = transition.get("from_state_id", String.class);
        String toStateId   = transition.get("to_state_id",   String.class);
        String guardExpr   = transition.get("guard_expr",    String.class);
        String actionType  = transition.get("action_type",   String.class);

        // Vérifier l'état courant (version publique)
        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) throw new IllegalStateException("Node has no version: " + nodeId);
        String currentStateId = current.get("lifecycle_state_id", String.class);
        if (!fromStateId.equals(currentStateId))
            throw new IllegalStateException("Node is not in state " + fromStateId + " (is: " + currentStateId + ")");

        // Vérifier permission transition
        // (délégué à permissionService dans NodeController — ici on fait confiance à l'appelant)

        // Acquérir le lock dans la transaction
        lockService.checkin(nodeId, userId, txId);

        // Évaluer la garde
        if (guardExpr != null && !evaluateGuard(guardExpr, nodeId, toStateId)) {
            throw new GuardException("Guard '" + guardExpr + "' failed for transition " + transitionId);
        }

        // Créer la version LIFECYCLE (pas d'incrément d'itération)
        String versionId = versionService.createVersion(
            nodeId, userId, txId,
            ChangeType.LIFECYCLE, toStateId,
            Collections.emptyMap(),
            "Lifecycle transition: " + fromStateId + " → " + toStateId
        );

        // Exécuter l'action post-transition
        if (actionType != null) executeAction(actionType, nodeId, userId, txId);

        log.info("Transition: node={} {}→{} tx={} user={}", nodeId, fromStateId, toStateId, txId, userId);
        return versionId;
    }

    public List<Record> getAvailableTransitions(String nodeId) {
        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) return Collections.emptyList();
        return dsl.select().from("lifecycle_transition")
            .where("from_state_id = ?", current.get("lifecycle_state_id", String.class)).fetch();
    }

    // ================================================================
    // Guards
    // ================================================================

    private boolean evaluateGuard(String guardExpr, String nodeId, String targetStateId) {
        return switch (guardExpr) {
            case "all_required_filled" -> checkAllRequiredFilled(nodeId, targetStateId);
            case "all_signatures_done" -> checkAllSignaturesDone(nodeId);
            default -> { log.warn("Unknown guard: {}", guardExpr); yield true; }
        };
    }

    private boolean checkAllRequiredFilled(String nodeId, String targetStateId) {
        String nodeTypeId = dsl.select().from("node").where("id = ?", nodeId)
                               .fetchOne("node_type_id", String.class);
        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) return false;
        String currentVersionId = current.get("id", String.class);
        int missing = dsl.fetchCount(dsl.select().from("attribute_definition ad")
            .join("attribute_state_rule asr").on("asr.attribute_definition_id = ad.id")
            .where("ad.node_type_id = ?", nodeTypeId)
            .and("asr.lifecycle_state_id = ?", targetStateId).and("asr.required = 1")
            .andNotExists(dsl.selectOne().from("node_version_attribute nva")
                .where("nva.node_version_id = ?", currentVersionId)
                .and("nva.attribute_def_id = ad.id").and("nva.value IS NOT NULL")));
        return missing == 0;
    }

    private boolean checkAllSignaturesDone(String nodeId) {
        return true; // TODO: implémenter avec SignatureRequirement
    }

    // ================================================================
    // Actions
    // ================================================================

    private void executeAction(String actionType, String nodeId, String userId, String txId) {
        if ("CASCADE_FROZEN".equals(actionType)) executeCascadeFrozen(nodeId, userId, txId);
        else log.warn("Unknown action: {}", actionType);
    }

    private void executeCascadeFrozen(String nodeId, String userId, String txId) {
        String frozenStateId = dsl.select(DSL.field("ls.id").as("ls_id"))
            .from("lifecycle_state ls")
            .join("node_type nt").on("nt.lifecycle_id = ls.lifecycle_id")
            .join("node n").on("n.node_type_id = nt.id")
            .where("n.id = ?", nodeId).and("ls.is_frozen = 1")
            .fetchOne("ls_id", String.class);
        if (frozenStateId == null) return;

        List<String> children = dsl.select(DSL.field("nl.target_node_id").as("target_node_id"))
            .from("node_link nl")
            .join("link_type lt").on("nl.link_type_id = lt.id")
            .where("nl.source_node_id = ?", nodeId)
            .and("lt.link_policy = 'VERSION_TO_MASTER'").and("nl.pinned_version_id IS NULL")
            .fetch("target_node_id", String.class);

        for (String childId : children) {
            lockService.checkin(childId, userId, txId);
            versionService.createVersion(childId, userId, txId,
                ChangeType.LIFECYCLE, frozenStateId, Collections.emptyMap(),
                "Cascade frozen from: " + nodeId);
            executeCascadeFrozen(childId, userId, txId);
        }
    }

    public static class GuardException extends com.plm.domain.exception.PlmFunctionalException {
        public GuardException(String msg) { super(msg, 422); }
    }
}
