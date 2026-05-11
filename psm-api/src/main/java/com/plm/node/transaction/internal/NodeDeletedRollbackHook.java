package com.plm.node.transaction.internal;

import com.plm.shared.event.PlmEventPublisher;
import com.plm.shared.hook.PostRollbackHook;
import com.plm.shared.hook.RollbackContext;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Emits ITEM_DELETED for each item that was physically removed by a rollback
 * (items created in the rolled-back transaction with no remaining versions).
 * Runs after TX_ROLLED_BACK and LOCK_RELEASED events are already enqueued.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NodeDeletedRollbackHook implements PostRollbackHook {

    private final PlmTransactionService txService;
    private final PlmEventPublisher eventPublisher;

    @PostConstruct
    void register() {
        txService.registerPostRollbackHook(this);
    }

    @Override
    public String name() {
        return "node-deleted-on-rollback";
    }

    @Override
    public void afterRollback(RollbackContext ctx) {
        for (String nodeId : ctx.deletedNodeIds()) {
            try {
                eventPublisher.itemDeleted(nodeId, ctx.userId());
            } catch (Exception e) {
                log.warn("Failed to emit ITEM_DELETED for nodeId={}: {}", nodeId, e.getMessage());
            }
        }
    }
}
