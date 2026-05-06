package com.plm.node.transaction.internal;

import com.plm.action.ActionWrapper;
import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.algorithm.AlgorithmParam;
import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * Transaction management wrapper.
 *
 * Manages PLM transaction lifecycle around action execution based on
 * the configured {@code tx_mode} parameter:
 * <ul>
 *   <li>{@code NONE}      — pass-through, no transaction</li>
 *   <li>{@code REQUIRED}  — tx must exist (fail if missing)</li>
 *   <li>{@code AUTO_OPEN} — find or create user's tx</li>
 *   <li>{@code ISOLATED}  — dedicated tx, auto-commit/rollback</li>
 * </ul>
 */
@Slf4j
@AlgorithmBean(code = "wrapper-transaction",
    name = "Transaction Wrapper",
    description = "Manages PLM transaction lifecycle around action execution")
@AlgorithmParam(name = "tx_mode", defaultValue = "REQUIRED")
@RequiredArgsConstructor
public class TransactionWrapper implements ActionWrapper {

    private final PlmTransactionService txService;

    @Override
    public ActionResult wrap(ActionContext context, Map<String, String> params,
                             Map<String, String> instanceParams, Chain chain) {
        String txMode = instanceParams.getOrDefault("tx_mode", "REQUIRED");
        String userId = context.userId();
        String txId = context.txId();

        return switch (txMode) {
            case "NONE" -> chain.proceed(context, params);

            case "REQUIRED" -> {
                if (txId == null)
                    throw new IllegalStateException(context.actionCode() + " requires an open transaction");
                yield chain.proceed(context, params);
            }

            case "AUTO_OPEN" -> {
                String effectiveTxId = txId;
                if (effectiveTxId == null) {
                    effectiveTxId = txService.findOpenTransaction(userId);
                    if (effectiveTxId == null) {
                        effectiveTxId = txService.openTransaction(userId);
                    }
                }
                yield chain.proceed(context.withTxId(effectiveTxId), params);
            }

            case "ISOLATED" -> {
                String isolatedTxId = txService.openTransaction(userId);
                try {
                    ActionResult result = chain.proceed(context.withTxId(isolatedTxId), params);
                    String comment = params.getOrDefault("_description", context.actionCode());
                    txService.commitTransaction(isolatedTxId, userId, comment, null);
                    yield result;
                } catch (Exception e) {
                    try { txService.rollbackTransaction(isolatedTxId, userId); }
                    catch (Exception rollbackErr) {
                        log.warn("Failed to rollback isolated tx {}: {}", isolatedTxId, rollbackErr.getMessage());
                    }
                    throw e;
                }
            }

            default -> throw new IllegalArgumentException("Unknown tx_mode: " + txMode);
        };
    }
}
