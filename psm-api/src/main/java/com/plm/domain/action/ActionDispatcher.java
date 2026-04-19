package com.plm.domain.action;

import com.plm.domain.service.LockService;
import com.plm.domain.service.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Central action executor.
 *
 * Responsibilities:
 *  1. Resolve the {@code action} row from its code.
 *  2. Manage transaction lifecycle based on {@code action.tx_mode}.
 *  3. Validate parameters via ActionParameterValidator.
 *  4. Route to the correct ActionHandler via ActionHandlerRegistry (or Spring bean for CUSTOM).
 *
 * Transaction modes:
 *  - NONE      — no tx needed
 *  - REQUIRED  — tx must exist (passed via header)
 *  - AUTO_OPEN — find or create user's tx if none passed
 *  - ISOLATED  — dedicated tx per execution, auto-commit/rollback
 *
 * Permission enforcement happens upstream (service-layer {@code @PlmAction} AOP).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionDispatcher {

    private final DSLContext               dsl;
    private final ApplicationContext       appContext;
    private final ActionParameterValidator paramValidator;
    private final ActionHandlerRegistry    handlerRegistry;
    private final PlmTransactionService    txService;
    private final LockService              lockService;

    /**
     * Dispatches an action by its {@code action.action_code}.
     *
     * @param actionCode      the {@code action.action_code}
     * @param transitionId    required for LIFECYCLE-scope actions, ignored otherwise
     * @param nodeId          target node (null for TX-scope actions)
     * @param currentStateId  current lifecycle state
     * @param userId          executing user
     * @param txId            open PLM transaction (may be null)
     * @param rawParams       user-supplied parameters
     */
    public ActionResult dispatch(
        String actionCode,
        String transitionId,
        String nodeId,
        String currentStateId,
        String userId,
        String txId,
        Map<String, String> rawParams
    ) {
        Record action = dsl.select().from("action")
            .where("action_code = ?", actionCode)
            .fetchOne();
        if (action == null) throw new IllegalArgumentException("Unknown action: " + actionCode);

        String actionId    = action.get("id",           String.class);
        String actionKind  = action.get("action_kind",  String.class);
        String handlerRef  = action.get("handler_ref",  String.class);
        String txMode      = action.get("tx_mode",      String.class);
        String scope       = action.get("scope",        String.class);

        String nodeTypeId = null;
        if (nodeId != null) {
            nodeTypeId = dsl.select(org.jooq.impl.DSL.field("node_type_id")).from("node")
                .where("id = ?", nodeId)
                .fetchOne(org.jooq.impl.DSL.field("node_type_id"), String.class);
        }

        Map<String, String> params = paramValidator.validate(actionId, nodeTypeId, rawParams);

        ActionHandler handler;
        if (handlerRegistry.hasHandler(actionCode)) {
            handler = handlerRegistry.getHandler(actionCode);
        } else if ("CUSTOM".equals(actionKind) && handlerRef != null && !handlerRef.isBlank()) {
            handler = appContext.getBean(handlerRef, ActionHandler.class);
        } else {
            throw new IllegalStateException("No handler registered for action code: " + actionCode);
        }

        // ── Transaction management based on tx_mode ──
        String effectiveTxId = txId;
        boolean isolatedTx = false;

        if ("ISOLATED".equals(txMode)) {
            // Acquire lock before creating tx — guards already evaluated by PlmActionAspect
            // before dispatch, so they don't see this lock. Fail-fast if locked by another user.
            if (nodeId != null) lockService.tryLock(nodeId, userId);
            effectiveTxId = txService.openTransaction(userId);
            isolatedTx = true;
        } else if ("AUTO_OPEN".equals(txMode) && txId == null) {
            effectiveTxId = txService.findOpenTransaction(userId);
            if (effectiveTxId == null) {
                effectiveTxId = txService.openTransaction(userId);
            }
        } else if ("REQUIRED".equals(txMode) && txId == null) {
            throw new IllegalStateException(actionCode + " requires an open transaction");
        }

        ActionContext ctx = new ActionContext(
            nodeId, nodeTypeId, actionId, actionCode, transitionId, userId, effectiveTxId);

        log.info("Dispatching action {} on node {} transition={} txMode={} by user {}",
            actionCode, nodeId, transitionId, txMode, userId);

        try {
            ActionResult result = handler.execute(ctx, params);

            if (isolatedTx) {
                String comment = params.getOrDefault("_description", actionCode);
                txService.commitTransaction(effectiveTxId, userId, comment, null);
            }

            return result;
        } catch (Exception e) {
            if (isolatedTx) {
                try { txService.rollbackTransaction(effectiveTxId, userId); }
                catch (Exception rollbackErr) {
                    log.warn("Failed to rollback isolated tx {}: {}", effectiveTxId, rollbackErr.getMessage());
                }
            }
            throw e;
        } finally {
            // Release isolated lock — commit/rollback already happened
            if (isolatedTx && nodeId != null) {
                try { lockService.unlock(nodeId); }
                catch (Exception unlockErr) {
                    log.warn("Failed to unlock node {} after isolated action: {}", nodeId, unlockErr.getMessage());
                }
            }
        }
    }
}
