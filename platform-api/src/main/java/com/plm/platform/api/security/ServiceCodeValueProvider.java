package com.plm.platform.api.security;

import com.plm.platform.authz.ScopeValueProvider;
import com.plm.platform.authz.dto.KeyValue;
import com.plm.platform.registry.LocalServiceRegistry;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class ServiceCodeValueProvider implements ScopeValueProvider {

    private final LocalServiceRegistry registry;

    public ServiceCodeValueProvider(LocalServiceRegistry registry) {
        this.registry = registry;
    }

    @Override
    public String scopeCode() { return "SERVICE"; }

    @Override
    public String keyName() { return "service_code"; }

    @Override
    public List<KeyValue> values(Map<String, String> parentPath) {
        return registry.allServiceCodes().stream()
            .sorted()
            .map(code -> new KeyValue(code, code))
            .toList();
    }
}
