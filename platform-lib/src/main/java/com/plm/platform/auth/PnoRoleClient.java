package com.plm.platform.auth;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.plm.platform.client.ServiceClient;

/**
 * Fetches role IDs for a (userId, projectSpaceId) pair from pno-api.
 * Called on cache miss by {@link PnoRoleCache}; result is cached there.
 */
public class PnoRoleClient {

    private static final Logger log = LoggerFactory.getLogger(PnoRoleClient.class);

    private final ServiceClient serviceClient;

    public PnoRoleClient(ServiceClient serviceClient) {
        this.serviceClient = serviceClient;
    }

    @SuppressWarnings("unchecked")
    public Set<String> fetchRoles(String userId, String projectSpaceId) {
        String path = "/api/pno/users/" + userId + "/context";
        if (projectSpaceId != null && !projectSpaceId.isBlank()) {
            path += "?projectSpaceId=" + projectSpaceId;
        }
        try {
            Map<String, Object> body = serviceClient.get("pno", path, Map.class);
            if (body == null) return Set.of();
            List<String> roles = (List<String>) body.getOrDefault("roleIds", List.of());
            return Set.copyOf(roles);
        } catch (Exception e) {
            log.warn("Role fetch failed for user={} ps={}: {}", userId, projectSpaceId, e.getMessage());
            throw e;
        }
    }
}
