package com.plm.platform.authz;

import com.plm.platform.authz.dto.KeyValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Auto-mounted REST endpoint that pno-api calls to enumerate values for
 * a (scope, key, optional parent path). Auto-discovers all
 * {@link ScopeValueProvider} beans in the application context.
 *
 * <p>Authenticated via {@code X-Service-Secret} (path is under
 * {@code /internal/**}).
 */
@Slf4j
@RestController
@RequestMapping("/internal/scope-values")
public class ScopeValueProviderController {

    private final Map<String, ScopeValueProvider> providers = new HashMap<>();

    public ScopeValueProviderController(List<ScopeValueProvider> registeredProviders) {
        for (ScopeValueProvider p : registeredProviders) {
            providers.put(key(p.scopeCode(), p.keyName()), p);
        }
        log.info("ScopeValueProviderController mounted with {} provider(s)", providers.size());
    }

    @GetMapping("/{scopeCode}/{keyName}")
    public List<KeyValue> values(@PathVariable String scopeCode,
                                 @PathVariable String keyName,
                                 @RequestParam(value = "parent", required = false) String parent) {
        ScopeValueProvider p = providers.get(key(scopeCode, keyName));
        if (p == null) return List.of();
        return p.values(parseParentPath(parent));
    }

    private static String key(String scope, String name) {
        return scope + ":" + name;
    }

    /**
     * Parses {@code k1=v1,k2=v2} into a map. Empty / null → empty map.
     */
    private static Map<String, String> parseParentPath(String parent) {
        Map<String, String> out = new HashMap<>();
        if (parent == null || parent.isBlank()) return out;
        for (String pair : parent.split(",")) {
            int idx = pair.indexOf('=');
            if (idx > 0 && idx < pair.length() - 1) {
                out.put(pair.substring(0, idx), pair.substring(idx + 1));
            }
        }
        return out;
    }
}
