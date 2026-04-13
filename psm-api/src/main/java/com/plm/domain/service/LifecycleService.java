package com.plm.domain.service;

import com.plm.domain.model.Enums.ChangeType;
import com.plm.domain.model.Enums.VersionStrategy;
import com.plm.infrastructure.PlmEventPublisher;
import com.plm.infrastructure.security.PlmAction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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

    private final DSLContext        dsl;
    private final VersionService    versionService;
    private final LockService       lockService;
    private final PlmEventPublisher eventPublisher;

    /**
     * Self-reference via Spring proxy for cascade calls.
     * Required so that recursive {@link #applyTransition} calls in
     * {@link #executeCascade} are intercepted by AOP (including {@link PlmAction}).
     * {@code @Lazy} breaks the circular dependency.
     */
    @Lazy
    @Autowired
    private LifecycleService self;

    /**
     * Applique une transition de lifecycle.
     *
     * @param txId  transaction PLM ouverte — OBLIGATOIRE
     */
    @PlmAction(value = "TRANSITION", nodeIdExpr = "#nodeId", transitionIdExpr = "#transitionId")
    @Transactional
    public String applyTransition(String nodeId, String transitionId, String userId, String txId) {
        Record transition = dsl.select().from("lifecycle_transition")
            .where("id = ?", transitionId).fetchOne();
        if (transition == null) throw new IllegalArgumentException("Transition not found: " + transitionId);

        String fromStateId      = transition.get("from_state_id",    String.class);
        String toStateId        = transition.get("to_state_id",      String.class);
        String guardExpr        = transition.get("guard_expr",       String.class);
        String actionType       = transition.get("action_type",      String.class);
        String strategyRaw      = transition.get("version_strategy", String.class);
        VersionStrategy strategy = strategyRaw != null
            ? VersionStrategy.valueOf(strategyRaw)
            : VersionStrategy.NONE;

        // Vérifier l'état courant (version publique)
        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) throw new IllegalStateException("Node has no version: " + nodeId);
        String currentStateId = current.get("lifecycle_state_id", String.class);
        if (!fromStateId.equals(currentStateId))
            throw new IllegalStateException("Node is not in state " + fromStateId + " (is: " + currentStateId + ")");

        // Vérifier permission transition
        // (délégué à permissionService dans NodeController — ici on fait confiance à l'appelant)

        // Évaluer la garde
        if (guardExpr != null && !evaluateGuard(guardExpr, nodeId, toStateId)) {
            throw new GuardException("Guard '" + guardExpr + "' failed for transition " + transitionId);
        }

        // Créer la version LIFECYCLE avec la stratégie de numérotation de la transition
        String versionId = versionService.createVersion(
            nodeId, userId, txId,
            ChangeType.LIFECYCLE, strategy, toStateId,
            Collections.emptyMap(),
            "Lifecycle transition: " + fromStateId + " → " + toStateId
        );

        // Acquiert le lock (conflit → exception + rollback) et écrit locked_by / locked_at.
        lockService.tryLock(nodeId, userId);

        // Cascade data-driven : consulte link_type_cascade pour la transition parente
        executeCascade(nodeId, transitionId, userId, txId);

        // Exécuter les actions supplémentaires (REQUIRE_SIGNATURE…)
        if (actionType != null && !"NONE".equals(actionType) && !"CASCADE_FROZEN".equals(actionType)) {
            executeAction(actionType, nodeId, userId, txId);
        }

        eventPublisher.stateChanged(nodeId, fromStateId, toStateId, userId);
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
        // Use explicit column to avoid duplicate "id" column in H2 derived-table wrapping
        int missing = dsl.fetchCount(dsl.select(DSL.field("ad.id")).from("attribute_definition ad")
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
        log.warn("Unknown or unhandled action type: {}", actionType);
    }

    /**
     * Data-driven cascade: for each outgoing link that has a cascade rule whose
     * parent_transition_id matches the transition just fired on the parent node,
     * fire the configured child transition on eligible child nodes.
     * No-op when no rules are defined for this transition.
     */
    private void executeCascade(String nodeId, String parentTransitionId, String userId, String txId) {
        // Find all cascade rules triggered by the parent firing parentTransitionId.
        // child_from_state_id scopes each rule: only children currently in that state
        // are eligible. Children in other states (e.g. Released) are silently skipped.
        // We join child_transition to obtain to_state_id for the diamond guard.
        var rules = dsl.select(
                DSL.field("nl.target_node_id").as("child_id"),
                DSL.field("ltc.child_from_state_id").as("child_from_state_id"),
                DSL.field("ltc.child_transition_id").as("child_transition_id"),
                DSL.field("lt.to_state_id").as("to_state_id")
            )
            .from("node_version_link nl")
            .join("link_type_cascade ltc").on("ltc.link_type_id = nl.link_type_id")
            .join("lifecycle_transition lt").on("lt.id = ltc.child_transition_id")
            .join("node_version nv_src").on("nv_src.id = nl.source_node_version_id")
            .where("nv_src.node_id = ?", nodeId)
            .and("ltc.parent_transition_id = ?", parentTransitionId)
            .and("nl.pinned_version_id IS NULL") // VERSION_TO_MASTER links only
            .fetch();

        List<String> errors = new ArrayList<>();

        for (Record rule : rules) {
            String childId            = rule.get("child_id",            String.class);
            String childFromStateId   = rule.get("child_from_state_id", String.class);
            String childTransitionId  = rule.get("child_transition_id", String.class);
            String toStateId          = rule.get("to_state_id",         String.class);

            // Idempotency guard: if the child already has an OPEN version in this
            // transaction that is already in the target state, the cascade was applied
            // via another branch (diamond hierarchy). Skip to avoid a duplicate
            // LIFECYCLE version with an identical fingerprint causing a false no-op error.
            Record openInTx = versionService.getCurrentVersionForTx(childId, txId);
            if (openInTx != null
                    && txId.equals(openInTx.get("tx_id", String.class))
                    && toStateId.equals(openInTx.get("lifecycle_state_id", String.class))) {
                log.debug("Cascade: child {} already at state {} in tx {} — skipping (diamond)", childId, toStateId, txId);
                continue;
            }

            // Resolve the child's current committed state
            Record childCurrent = versionService.getCurrentVersion(childId);
            if (childCurrent == null) {
                log.warn("Cascade: child node {} has no version, skipping", childId);
                continue;
            }
            String childCurrentStateId = childCurrent.get("lifecycle_state_id", String.class);

            // Rule scope check: this cascade rule only applies when the child is in
            // child_from_state_id. Children in any other state (e.g. Released, already
            // Frozen) are silently skipped — the rule simply doesn't concern them.
            if (!childFromStateId.equals(childCurrentStateId)) {
                log.debug("Cascade: child {} is in state {} (rule expects {}) — skipping",
                    childId, childCurrentStateId, childFromStateId);
                continue;
            }

            // Delegate to applyTransition using the exact transition configured in the rule.
            // Guards, versioning strategy, actions and recursive cascade are all handled inside.
            // Catch and flatten errors so the user gets a complete picture of what's blocking.
            String childLabel = resolveLabel(childId);
            try {
                self.applyTransition(childId, childTransitionId, userId, txId);
            } catch (CascadeBlockedException cbe) {
                // Flatten nested cascade errors from sub-children
                errors.addAll(cbe.getBlockedNodes());
            } catch (Exception e) {
                errors.add("'" + childLabel + "': " + e.getMessage());
            }
        }

        if (!errors.isEmpty()) {
            throw new CascadeBlockedException(errors);
        }
    }

    private String resolveLabel(String nodeId) {
        String logicalId = dsl.select().from("node").where("id = ?", nodeId)
            .fetchOne("logical_id", String.class);
        return logicalId != null ? logicalId : nodeId;
    }

    public static class GuardException extends com.plm.domain.exception.PlmFunctionalException {
        public GuardException(String msg) { super(msg, 422); }
    }

    public static class CascadeBlockedException extends com.plm.domain.exception.PlmFunctionalException {
        private final List<String> blockedNodes;

        public CascadeBlockedException(List<String> blockedNodes) {
            super("Cascade blocked — the following nodes cannot be transitioned:\n"
                + blockedNodes.stream().map(s -> "  • " + s).collect(java.util.stream.Collectors.joining("\n")),
                422);
            this.blockedNodes = List.copyOf(blockedNodes);
        }

        public List<String> getBlockedNodes() { return blockedNodes; }
    }
}
