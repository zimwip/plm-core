package com.plm.platform.action;

import java.util.Optional;

/**
 * Port: resolves node/link context needed by PlmActionAspect for permission
 * and guard evaluation. Implemented by the consuming service (e.g. psm-api).
 */
public interface ActionNodeContextPort {

    record NodeCtx(
        String nodeId,
        String nodeTypeId,
        String currentStateId,
        boolean isLocked,
        boolean isLockedByCurrentUser
    ) {}

    Optional<NodeCtx> resolveFromNodeId(String nodeId, String userId);

    Optional<NodeCtx> resolveFromLinkId(String linkId, String userId);
}
