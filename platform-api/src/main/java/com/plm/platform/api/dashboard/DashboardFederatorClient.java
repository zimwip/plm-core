package com.plm.platform.api.dashboard;

import com.plm.platform.PlatformPaths;
import com.plm.platform.api.environment.EnvironmentRegistry;
import com.plm.platform.client.ServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Federates dashboard entry queries across all services that declared the
 * "dashboard" feature at registration time. Services that are down are skipped
 * with a warning — partial results are preferable to a total failure.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DashboardFederatorClient {

    private static final ParameterizedTypeReference<List<Map<String, Object>>> SECTIONS_LIST =
            new ParameterizedTypeReference<>() {};

    private final EnvironmentRegistry environmentRegistry;
    private final ServiceClient       serviceClient;

    public List<Map<String, Object>> fetchEntries() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (String serviceCode : environmentRegistry.servicesWithFeature("dashboard")) {
            String path = PlatformPaths.internalPath(serviceCode, "/dashboard/entries");
            try {
                List<Map<String, Object>> sections = serviceClient.get(serviceCode, path, SECTIONS_LIST);
                if (sections != null) result.addAll(sections);
            } catch (Exception e) {
                log.warn("Skipping dashboard entries from {}: {}", serviceCode, upstreamError(e));
            }
        }
        return result;
    }

    private static String upstreamError(Exception e) {
        if (e instanceof HttpStatusCodeException hsce) {
            String body = hsce.getResponseBodyAsString();
            return hsce.getStatusCode() + (body.isBlank() ? "" : " — " + body);
        }
        return e.getMessage();
    }
}
