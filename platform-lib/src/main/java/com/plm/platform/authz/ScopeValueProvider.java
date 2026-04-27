package com.plm.platform.authz;

import com.plm.platform.authz.dto.KeyValue;

import java.util.List;
import java.util.Map;

/**
 * SPI a service implements to expose the list of values for one (scope, key).
 * Multiple providers may exist per (scope, key) — pno aggregates across all
 * registered services.
 *
 * <p>{@code parentPath} is the resolved values for keys earlier in the scope's
 * ordered key list (empty for top-level keys; e.g., {@code {nodeType: "nt-part"}}
 * when serving the {@code transition} key for {@code LIFECYCLE}).
 */
public interface ScopeValueProvider {

    String scopeCode();

    String keyName();

    List<KeyValue> values(Map<String, String> parentPath);
}
