package com.plm.node.transaction.internal;

import com.plm.shared.event.PlmEventPublisher;
import com.plm.shared.hook.CommitResult;
import com.plm.shared.hook.PostCommitHook;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Emits ITEM_VERSION_CREATED for each item whose version was committed.
 * Runs before unlock so LOCK_RELEASED fires after ITEM_VERSION_CREATED.
 * Event order at commit: ITEM_VERSION_CREATED → LOCK_RELEASED → TX_COMMITTED.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NodeVersionCreatedCommitHook implements PostCommitHook {

    private final PlmTransactionService txService;
    private final PlmEventPublisher eventPublisher;

    @PostConstruct
    void register() {
        txService.registerPostCommitHook(this);
    }

    @Override
    public String name() {
        return "node-version-created-on-commit";
    }

    @Override
    public void afterCommit(CommitResult result) {
        for (String nodeId : result.committedNodeIds()) {
            try {
                eventPublisher.itemVersionCreated(nodeId, result.userId());
            } catch (Exception e) {
                log.warn("Failed to emit ITEM_VERSION_CREATED for nodeId={}: {}", nodeId, e.getMessage());
            }
        }
    }
}
