package com.plm.shared.node;

import java.util.Optional;
import java.util.UUID;

/**
 * Port for looking up nodes without depending on the {@code node} module.
 *
 * <p>Lets modules that may only depend on {@code shared} (e.g. {@code cad})
 * resolve nodes. Implemented by {@code NodeLookupAdapter} in the {@code node} module.
 */
public interface NodeLookupPort {

    /** Resolves a node by its external id, or empty if none matches. */
    Optional<UUID> findByExternalId(String externalId);
}
