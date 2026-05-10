package com.plm.node.link.internal;

import com.plm.node.transaction.internal.PlmTransactionService;
import com.plm.shared.hook.PostRollbackHook;
import com.plm.shared.hook.RollbackContext;
import com.plm.source.SourceResolverContext;
import com.plm.source.SourceResolverRegistry;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Calls SourceResolver#detach for every link rolled back in a transaction.
 * Resolvers with a no-op detach (SELF, etc.) are unaffected; DataResolver
 * uses this to decrement the dst reference count so GC can reclaim the blob.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DstDetachRollbackHook implements PostRollbackHook {

    private final PlmTransactionService txService;
    private final SourceResolverRegistry resolverRegistry;

    @PostConstruct
    void register() {
        txService.registerPostRollbackHook(this);
    }

    @Override
    public String name() {
        return "dst-detach-on-rollback";
    }

    @Override
    public void afterRollback(RollbackContext ctx) {
        for (RollbackContext.RolledBackLink link : ctx.links()) {
            try {
                resolverRegistry.getResolverFor(link.targetSourceCode())
                    .detach(new SourceResolverContext(
                        link.linkTypeId(), link.targetType(), link.targetKey(),
                        link.sourceVersionId(), link.sourceNodeId()));
            } catch (Exception e) {
                log.warn("detach failed on rollback for link={} target={}/{}: {}",
                    link.linkId(), link.targetSourceCode(), link.targetKey(), e.getMessage());
            }
        }
    }
}
