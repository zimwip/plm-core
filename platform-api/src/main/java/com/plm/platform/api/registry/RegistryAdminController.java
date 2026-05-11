package com.plm.platform.api.registry;

import com.plm.platform.api.environment.EnvironmentRegistry;
import com.plm.platform.api.environment.ServiceRegistration;
import com.plm.platform.api.security.SettingsSecurityContext;
import com.plm.platform.api.security.SettingsUserContext;
import com.plm.platform.environment.PlatformRegistrationProperties;
import com.plm.platform.item.dto.ItemDescriptor;
import com.plm.platform.item.dto.ItemVisibilityContext;
import com.plm.platform.PlatformPaths;
import com.plm.platform.client.ServiceClient;
import com.plm.platform.registry.LocalServiceRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Admin view over the environment registry. Reads directly from the
 * in-process {@link EnvironmentRegistry} — no longer a cross-service proxy.
 *
 * <p>Backs the "Service Registry" Settings tab.
 */
@Slf4j
@RestController
@RequestMapping("/admin/registry")
public class RegistryAdminController {

    private static final String REQUIRED_PERMISSION = "MANAGE_PLATFORM";

    private final EnvironmentRegistry environmentRegistry;
    private final ServiceClient serviceClient;
    private final LocalServiceRegistry localRegistry;
    private final SettingsSectionRegistry settingsRegistry;
    private final PlatformRegistrationProperties platformProps;
    private final com.plm.platform.api.client.PnoApiClient pnoApiClient;

    public RegistryAdminController(EnvironmentRegistry environmentRegistry,
                                   ServiceClient serviceClient,
                                   LocalServiceRegistry localRegistry,
                                   SettingsSectionRegistry settingsRegistry,
                                   PlatformRegistrationProperties platformProps,
                                   com.plm.platform.api.client.PnoApiClient pnoApiClient) {
        this.environmentRegistry = environmentRegistry;
        this.serviceClient = serviceClient;
        this.localRegistry = localRegistry;
        this.settingsRegistry = settingsRegistry;
        this.platformProps = platformProps;
        this.pnoApiClient = pnoApiClient;
    }

    @GetMapping("/grouped")
    public ResponseEntity<?> grouped() {
        if (!isAdmin()) return ResponseEntity.status(403).build();
        Map<String, List<Map<String, Object>>> body = new LinkedHashMap<>();
        Instant now = Instant.now();
        for (var entry : environmentRegistry.allInstancesByService().entrySet()) {
            List<Map<String, Object>> instances = entry.getValue().stream()
                .map(r -> serializeInstance(r, now))
                .toList();
            body.put(entry.getKey(), instances);
        }
        return ResponseEntity.ok(body);
    }

    @GetMapping("/tags")
    public ResponseEntity<?> tags() {
        if (!isAdmin()) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(environmentRegistry.tagsByService());
    }

    private Map<String, Object> serializeInstance(ServiceRegistration r, Instant now) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("instanceId", r.instanceId());
        m.put("serviceCode", r.serviceCode());
        m.put("baseUrl", r.baseUrl());
        m.put("version", r.version());
        m.put("spaceTag", r.spaceTag());
        m.put("untagged", r.isUntagged());
        m.put("registeredAt", r.registeredAt().toString());
        m.put("lastHeartbeatOk", r.lastHeartbeatOk() != null ? r.lastHeartbeatOk().toString() : null);
        m.put("consecutiveFailures", r.consecutiveFailures());
        m.put("healthy", r.consecutiveFailures() == 0);
        m.put("ageSeconds", r.lastHeartbeatOk() != null
            ? Duration.between(r.lastHeartbeatOk(), now).toSeconds() : null);
        return m;
    }

    @GetMapping("/overview")
    public ResponseEntity<?> overview() {
        if (!isAdmin()) return ResponseEntity.status(403).build();

        SettingsUserContext ctx = SettingsSecurityContext.get();
        ItemVisibilityContext probeCtx = new ItemVisibilityContext(
            ctx.getUserId(), null, true, ctx.getRoleIds(), ctx.getGlobalPermissions());

        Set<String> serviceCodes = localRegistry.allServiceCodes();
        Map<String, Map<String, Object>> byService = new LinkedHashMap<>();

        for (String code : serviceCodes) {
            List<ItemDescriptor> items = probeItems(code, probeCtx);
            int creatable = (int) items.stream().filter(d -> d.create() != null).count();
            int listable  = (int) items.stream().filter(d -> d.list()   != null).count();

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("instances", localRegistry.getInstances(code).size());
            entry.put("settingsSections", settingsRegistry.getSectionsForService(code).size());
            entry.put("itemDescriptors", items.size());
            entry.put("creatableItems", creatable);
            entry.put("listableItems",  listable);
            byService.put(code, entry);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("self", platformProps.serviceCode());
        body.put("services", byService);
        body.put("settingsRegistrations", settingsRegistry.allRegistrations());
        return ResponseEntity.ok(body);
    }

    private List<ItemDescriptor> probeItems(String serviceCode, ItemVisibilityContext context) {
        try {
            String path = PlatformPaths.internalPath(serviceCode, "/items/visible");
            List<ItemDescriptor> body = serviceClient.post(serviceCode, path, context,
                new ParameterizedTypeReference<List<ItemDescriptor>>() {});
            return body == null ? List.of() : body;
        } catch (Exception e) {
            return List.of();
        }
    }

    private boolean isAdmin() {
        SettingsUserContext u = SettingsSecurityContext.getOrNull();
        if (u == null) {
            log.warn("Registry admin call without bound user context");
            return false;
        }
        if (u.isAdmin()) return true;
        SettingsUserContext fetched = pnoApiClient.getUserContext(u.getUserId(), null);
        if (fetched == null) return false;
        if (fetched.isAdmin()) return true;
        Set<String> grants = fetched.getGlobalPermissions();
        return grants != null && grants.contains(REQUIRED_PERMISSION);
    }
}
