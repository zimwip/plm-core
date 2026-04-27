package com.pno.domain.accessrights;

import com.plm.platform.authz.dto.KeyValue;
import com.plm.platform.authz.dto.ScopeKeyDefinition;
import com.plm.platform.spe.client.ServiceClient;
import com.pno.domain.scope.AuthorizationSnapshotVersion;
import com.pno.domain.scope.PermissionScopeRegistry;
import com.pno.domain.scope.PermissionScopeRegistry.ScopeRecord;
import com.pno.domain.scope.PermissionScopeRegistry.ValueSourceRecord;
import com.pno.domain.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Aggregates the access-rights model the frontend renders: scope catalog,
 * permission catalog, and the per-key value lists pulled from each contributing
 * service's {@code /internal/scope-values/{scope}/{key}} endpoint.
 *
 * <p>Cached per (snapshot version × projectSpaceId). Invalidated when the
 * snapshot version bumps (grant CRUD or {@code SCOPE_VALUES_CHANGED} cascade).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AccessRightsTreeService {

    private final PermissionScopeRegistry scopeRegistry;
    private final AuthorizationService authorizationService;
    private final AuthorizationSnapshotVersion versionStamp;
    private final ServiceClient serviceClient;

    private final Map<String, Map<String, Object>> cache = new ConcurrentHashMap<>();

    public Map<String, Object> tree(String projectSpaceId) {
        long v = versionStamp.current();
        String cacheKey = v + "::" + projectSpaceId;
        // Drop entries from older snapshot versions so the cache stays bounded.
        cache.keySet().removeIf(k -> !k.startsWith(v + "::"));
        return cache.computeIfAbsent(cacheKey, k -> buildTree(projectSpaceId));
    }

    public void invalidate() {
        cache.clear();
    }

    private Map<String, Object> buildTree(String projectSpaceId) {
        Map<String, Object> root = new LinkedHashMap<>();
        root.put("version", versionStamp.current());
        root.put("permissions", authorizationService.listPermissions());

        List<Map<String, Object>> scopeOut = new ArrayList<>();
        for (ScopeRecord rec : scopeRegistry.snapshot().values()) {
            Map<String, Object> sm = new LinkedHashMap<>();
            sm.put("code", rec.scopeCode());
            sm.put("parent", rec.parentScopeCode());
            sm.put("description", rec.description());

            List<Map<String, Object>> keyOut = new ArrayList<>();
            List<ScopeKeyDefinition> ownKeys = rec.keys();
            List<ScopeKeyDefinition> parentKeys = parentEffectiveKeys(rec);

            for (ScopeKeyDefinition pk : parentKeys) {
                Map<String, Object> km = new LinkedHashMap<>();
                km.put("name", pk.name());
                km.put("inheritedFrom", rec.parentScopeCode());
                keyOut.add(km);
            }

            for (ScopeKeyDefinition ok : ownKeys) {
                Map<String, Object> km = new LinkedHashMap<>();
                km.put("name", ok.name());
                km.put("description", ok.description());
                if (parentKeys.isEmpty()) {
                    km.put("values", fetchFlatValues(rec.scopeCode(), ok.name()));
                } else {
                    km.put("valuesByParent", fetchValuesByParent(rec.scopeCode(), ok.name(), parentKeys));
                }
                keyOut.add(km);
            }
            sm.put("keys", keyOut);
            scopeOut.add(sm);
        }
        root.put("scopes", scopeOut);
        return root;
    }

    private List<ScopeKeyDefinition> parentEffectiveKeys(ScopeRecord rec) {
        if (rec.parentScopeCode() == null) return List.of();
        return scopeRegistry.effectiveKeys(rec.parentScopeCode());
    }

    private List<KeyValue> fetchFlatValues(String scopeCode, String keyName) {
        List<KeyValue> merged = new ArrayList<>();
        for (ValueSourceRecord vs : sourcesFor(scopeCode, keyName)) {
            merged.addAll(callValueSource(vs, ""));
        }
        return merged;
    }

    private Map<String, List<KeyValue>> fetchValuesByParent(String scopeCode, String keyName, List<ScopeKeyDefinition> parentKeys) {
        Map<String, List<KeyValue>> out = new LinkedHashMap<>();
        // For now, single-level parent only (matches LIFECYCLE → NODE today).
        if (parentKeys.size() != 1) return out;
        String parentKeyName = parentKeys.get(0).name();
        // Resolve the parent key value list from the parent scope record.
        ScopeRecord parentRec = scopeRegistry.get(parentScopeCode(scopeCode));
        if (parentRec == null) return out;
        List<KeyValue> parentValues = fetchFlatValues(parentRec.scopeCode(), parentKeyName);
        for (KeyValue pv : parentValues) {
            String parentParam = parentKeyName + "=" + pv.id();
            List<KeyValue> sub = new ArrayList<>();
            for (ValueSourceRecord vs : sourcesFor(scopeCode, keyName)) {
                sub.addAll(callValueSource(vs, parentParam));
            }
            out.put(pv.id(), sub);
        }
        return out;
    }

    private String parentScopeCode(String scopeCode) {
        ScopeRecord rec = scopeRegistry.get(scopeCode);
        return rec == null ? null : rec.parentScopeCode();
    }

    private List<ValueSourceRecord> sourcesFor(String scopeCode, String keyName) {
        ScopeRecord rec = scopeRegistry.get(scopeCode);
        if (rec == null) return List.of();
        List<ValueSourceRecord> out = new ArrayList<>();
        for (ValueSourceRecord vs : rec.valueSources()) {
            if (vs.keyName().equals(keyName)) out.add(vs);
        }
        return out;
    }

    @SuppressWarnings("unchecked")
    private List<KeyValue> callValueSource(ValueSourceRecord vs, String parentQuery) {
        String basePath = "/api/" + vs.serviceCode() + "/internal" + vs.endpointPath();
        boolean hasParent = parentQuery != null && !parentQuery.isBlank();
        // RestTemplate URI templates URL-encode {var} substitutions, so we pass
        // parentQuery raw (e.g. "nodeType=nt-part") as a uriVar — letting the
        // template substitute it produces "?parent=nodeType%3Dnt-part" which the
        // server decodes back to "nodeType=nt-part".
        String pathTemplate = hasParent ? basePath + "?parent={parent}" : basePath;
        try {
            List<Map<String, Object>> raw = hasParent
                ? serviceClient.get(vs.serviceCode(), pathTemplate,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}, parentQuery)
                : serviceClient.get(vs.serviceCode(), pathTemplate,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            if (raw == null) return List.of();
            List<KeyValue> out = new ArrayList<>(raw.size());
            for (Map<String, Object> m : raw) {
                out.add(new KeyValue(
                    String.valueOf(m.get("id")),
                    String.valueOf(m.get("label"))
                ));
            }
            return out;
        } catch (Exception e) {
            log.warn("Value source fetch failed: service={} path={} — {}", vs.serviceCode(), pathTemplate, e.getMessage());
            return List.of();
        }
    }
}
