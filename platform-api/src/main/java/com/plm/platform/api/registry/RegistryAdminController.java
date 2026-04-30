package com.plm.platform.api.registry;

import com.plm.platform.api.security.SettingsSecurityContext;
import com.plm.platform.api.security.SettingsUserContext;
import com.plm.platform.browse.dto.ListableDescriptor;
import com.plm.platform.resource.dto.ResourceDescriptor;
import com.plm.platform.resource.dto.ResourceVisibilityContext;
import com.plm.platform.spe.PlatformPaths;
import com.plm.platform.spe.SpeRegistrationProperties;
import com.plm.platform.spe.client.ServiceClient;
import com.plm.platform.spe.registry.LocalServiceRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Read-only admin proxy over spe-api's registry. Spe-api gates
 * {@code /api/spe/registry/**} behind {@code X-Service-Secret}, which the
 * browser cannot carry; this controller forwards the call from server-side
 * with the secret injected by {@link ServiceClient} and gates exposure
 * behind the platform admin user context.
 *
 * <p>Backs the "Service Registry" Settings tab.
 */
@Slf4j
@RestController
@RequestMapping("/admin/registry")
public class RegistryAdminController {

    private static final String REQUIRED_PERMISSION = "MANAGE_PLATFORM";

    private final ServiceClient serviceClient;
    private final LocalServiceRegistry localRegistry;
    private final SettingsSectionRegistry settingsRegistry;
    private final SpeRegistrationProperties speProps;
    private final com.plm.platform.api.client.PnoApiClient pnoApiClient;
    /**
     * Direct client to spe-api. spe-api never registers itself in its own
     * registry, so the registry-aware {@link ServiceClient} cannot resolve
     * "spe" (would throw ServiceUnavailableException). The proxy uses
     * {@link SpeRegistrationProperties#speUrl()} as the well-known base URL
     * and injects {@code X-Service-Secret} manually — same auth that gates
     * spe-api's {@code /api/spe/registry/**} endpoints.
     */
    private final RestTemplate speDirectClient;

    public RegistryAdminController(ServiceClient serviceClient,
                                   LocalServiceRegistry localRegistry,
                                   SettingsSectionRegistry settingsRegistry,
                                   SpeRegistrationProperties speProps,
                                   com.plm.platform.api.client.PnoApiClient pnoApiClient,
                                   RestTemplateBuilder restTemplateBuilder) {
        this.serviceClient = serviceClient;
        this.localRegistry = localRegistry;
        this.settingsRegistry = settingsRegistry;
        this.speProps = speProps;
        this.pnoApiClient = pnoApiClient;
        this.speDirectClient = restTemplateBuilder.build();
    }

    @GetMapping("/grouped")
    public ResponseEntity<?> grouped() {
        if (!isAdmin()) return ResponseEntity.status(403).build();
        try {
            Map<String, List<Map<String, Object>>> body = speGet(
                "/api/spe/registry/grouped",
                new ParameterizedTypeReference<Map<String, List<Map<String, Object>>>>() {});
            return ResponseEntity.ok(body != null ? body : Map.of());
        } catch (Exception e) {
            log.warn("Registry proxy /grouped failed: {}", e.getMessage());
            return ResponseEntity.status(502).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/tags")
    public ResponseEntity<?> tags() {
        if (!isAdmin()) return ResponseEntity.status(403).build();
        try {
            Map<String, Object> body = speGet(
                "/api/spe/registry/tags",
                new ParameterizedTypeReference<Map<String, Object>>() {});
            return ResponseEntity.ok(body != null ? body : Map.of());
        } catch (Exception e) {
            log.warn("Registry proxy /tags failed: {}", e.getMessage());
            return ResponseEntity.status(502).body(Map.of("error", e.getMessage()));
        }
    }

    private <T> T speGet(String path, ParameterizedTypeReference<T> type) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Service-Secret", speProps.serviceSecret());
        ResponseEntity<T> resp = speDirectClient.exchange(
            speProps.speUrl() + path, HttpMethod.GET, new HttpEntity<>(headers), type);
        return resp.getBody();
    }

    /**
     * Platform-side view: per-service summary of what this platform-api knows
     * about — settings tabs registered, live resource/browse contributions,
     * registry membership. Useful operational counterpart to {@code /grouped}
     * which only mirrors spe-api.
     */
    @GetMapping("/overview")
    public ResponseEntity<?> overview() {
        if (!isAdmin()) return ResponseEntity.status(403).build();

        SettingsUserContext ctx = SettingsSecurityContext.get();
        ResourceVisibilityContext probeCtx = new ResourceVisibilityContext(
            ctx.getUserId(), null, true, ctx.getRoleIds(), ctx.getGlobalPermissions());

        Set<String> serviceCodes = localRegistry.allServiceCodes();
        Map<String, Map<String, Object>> byService = new LinkedHashMap<>();

        for (String code : serviceCodes) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("instances", localRegistry.getInstances(code).size());
            entry.put("settingsSections", settingsRegistry.getSectionsForService(code).size());
            entry.put("resourceDescriptors", probeAxis(code, "/resources/visible", true, probeCtx));
            entry.put("browseDescriptors",   probeAxis(code, "/browse/visible",    false, probeCtx));
            byService.put(code, entry);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("self", speProps.serviceCode());
        body.put("services", byService);
        body.put("settingsRegistrations", settingsRegistry.allRegistrations());
        return ResponseEntity.ok(body);
    }

    private int probeAxis(String serviceCode, String relPath, boolean resource,
                          ResourceVisibilityContext context) {
        try {
            String path = PlatformPaths.internalPath(serviceCode, relPath);
            if (resource) {
                List<ResourceDescriptor> body = serviceClient.post(serviceCode, path, context,
                    new ParameterizedTypeReference<List<ResourceDescriptor>>() {});
                return body == null ? 0 : body.size();
            }
            List<ListableDescriptor> body = serviceClient.post(serviceCode, path, context,
                new ParameterizedTypeReference<List<ListableDescriptor>>() {});
            return body == null ? 0 : body.size();
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Allow access if either the JWT principal is admin, or the user holds
     * the {@link #REQUIRED_PERMISSION} global grant pulled live from pno-api.
     * Mirrors the gating logic of {@code SettingsSectionsController}: admin
     * bypass, otherwise per-permission check.
     */
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
