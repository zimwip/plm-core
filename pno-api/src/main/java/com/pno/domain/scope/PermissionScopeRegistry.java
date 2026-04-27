package com.pno.domain.scope;

import com.plm.platform.authz.dto.ScopeKeyDefinition;
import com.plm.platform.authz.dto.ScopeRegistration;
import com.plm.platform.authz.dto.ScopeValueSourceDefinition;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory mirror of the scope catalog backed by the {@code permission_scope},
 * {@code permission_scope_key}, and {@code permission_scope_value_source} tables.
 *
 * <p>Loaded at boot. Reload after every successful registration so concurrent
 * read paths (snapshot endpoint, access-rights tree) always see the freshest
 * shape without an extra DB hit.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionScopeRegistry {

    private final DSLContext dsl;

    private final Map<String, ScopeRecord> scopesByCode = new ConcurrentHashMap<>();

    @PostConstruct
    public void load() {
        Map<String, ScopeRecord> next = new HashMap<>();

        for (Record r : dsl.fetch("SELECT scope_code, parent_scope_code, description, definition_hash, owner_service FROM permission_scope")) {
            String code = r.get("scope_code", String.class);
            next.put(code, new ScopeRecord(
                code,
                r.get("parent_scope_code", String.class),
                r.get("description", String.class),
                r.get("definition_hash", String.class),
                r.get("owner_service", String.class),
                new ArrayList<>(),
                new ArrayList<>()
            ));
        }

        for (Record r : dsl.fetch("SELECT scope_code, key_position, key_name, description FROM permission_scope_key ORDER BY scope_code, key_position")) {
            String code = r.get("scope_code", String.class);
            ScopeRecord rec = next.get(code);
            if (rec != null) {
                rec.keys.add(new ScopeKeyDefinition(
                    r.get("key_name", String.class),
                    r.get("description", String.class)
                ));
            }
        }

        for (Record r : dsl.fetch("SELECT scope_code, key_name, service_code, endpoint_path FROM permission_scope_value_source ORDER BY scope_code, key_name, service_code")) {
            String code = r.get("scope_code", String.class);
            ScopeRecord rec = next.get(code);
            if (rec != null) {
                rec.valueSources.add(new ValueSourceRecord(
                    r.get("key_name", String.class),
                    r.get("service_code", String.class),
                    r.get("endpoint_path", String.class)
                ));
            }
        }

        scopesByCode.clear();
        scopesByCode.putAll(next);
        log.info("PermissionScopeRegistry loaded: {} scope(s)", scopesByCode.size());
    }

    public Map<String, ScopeRecord> snapshot() {
        return Map.copyOf(scopesByCode);
    }

    public ScopeRecord get(String scopeCode) {
        return scopesByCode.get(scopeCode);
    }

    /**
     * Builds an ordered key list for a scope including inherited keys from its
     * parent chain. Used when validating grant submissions.
     */
    public List<ScopeKeyDefinition> effectiveKeys(String scopeCode) {
        List<ScopeKeyDefinition> out = new ArrayList<>();
        collectKeys(scopeCode, out);
        return out;
    }

    private void collectKeys(String scopeCode, List<ScopeKeyDefinition> out) {
        ScopeRecord rec = scopesByCode.get(scopeCode);
        if (rec == null) return;
        if (rec.parentScopeCode != null) collectKeys(rec.parentScopeCode, out);
        out.addAll(rec.keys);
    }

    /**
     * Convert a snapshot record back to the on-the-wire shape for re-publication.
     */
    public ScopeRegistration toRegistration(ScopeRecord rec) {
        List<ScopeValueSourceDefinition> sources = new ArrayList<>();
        for (ValueSourceRecord v : rec.valueSources) {
            sources.add(new ScopeValueSourceDefinition(v.keyName, v.endpointPath));
        }
        return new ScopeRegistration(
            rec.scopeCode,
            rec.parentScopeCode,
            rec.description,
            List.copyOf(rec.keys),
            sources
        );
    }

    public record ScopeRecord(
        String scopeCode,
        String parentScopeCode,
        String description,
        String definitionHash,
        String ownerService,
        List<ScopeKeyDefinition> keys,
        List<ValueSourceRecord> valueSources
    ) {}

    public record ValueSourceRecord(
        String keyName,
        String serviceCode,
        String endpointPath
    ) {}
}
