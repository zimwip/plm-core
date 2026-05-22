package com.plm.node;

import com.plm.shared.node.NodeLookupPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * Exposes {@link NodeService} node lookups to modules that may only depend on {@code shared}.
 */
@Component
@RequiredArgsConstructor
public class NodeLookupAdapter implements NodeLookupPort {

    private final NodeService nodeService;

    @Override
    public Optional<UUID> findByExternalId(String externalId) {
        return nodeService.findByExternalId(externalId);
    }
}
