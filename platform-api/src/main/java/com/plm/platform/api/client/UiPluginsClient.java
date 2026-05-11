package com.plm.platform.api.client;

import com.plm.platform.api.api.UiPluginManifestEntry;
import com.plm.platform.api.environment.EnvironmentRegistry;
import com.plm.platform.client.ServiceClient;
import com.plm.platform.ui.UiPluginDeclaration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Federates UI plugin declarations from all registered services.
 * Calls {@code /api/<serviceCode>/internal/ui/plugins} on each service.
 * Services that are down or have no UI plugins return silently.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UiPluginsClient {

    private static final ParameterizedTypeReference<List<UiPluginDeclaration>> PLUGIN_LIST =
            new ParameterizedTypeReference<>() {};

    private final EnvironmentRegistry environmentRegistry;
    private final ServiceClient serviceClient;

    public List<UiPluginManifestEntry> fetchAll() {
        List<UiPluginManifestEntry> result = new ArrayList<>();

        for (String serviceCode : environmentRegistry.serviceCodes()) {
            String path = "/api/" + serviceCode + "/internal/ui/plugins";
            try {
                List<UiPluginDeclaration> plugins = serviceClient.get(serviceCode, path, PLUGIN_LIST);
                if (plugins == null) continue;
                for (UiPluginDeclaration p : plugins) {
                    result.add(new UiPluginManifestEntry(
                            p.pluginId(),
                            serviceCode,
                            p.zone(),
                            "/api/" + serviceCode + "/ui/" + p.entryPath(),
                            p.requiredPermission()
                    ));
                }
            } catch (Exception e) {
                log.debug("No UI plugins from {}: {}", serviceCode, e.getMessage());
            }
        }

        return result;
    }
}
