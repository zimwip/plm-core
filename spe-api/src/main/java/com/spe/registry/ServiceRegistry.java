package com.spe.registry;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Multi-instance service registry.
 *
 * Each {@code serviceCode} maps to a pool of {@link ServiceRegistration} entries.
 * The gateway load-balances between healthy instances via {@link #pickInstance(String)}
 * (round-robin). Failed instances are evicted by the heartbeat scheduler.
 */
@Slf4j
@Component
public class ServiceRegistry {

    private final ConcurrentHashMap<String, ConcurrentHashMap<String, ServiceRegistration>> byService = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();
    private final ApplicationEventPublisher publisher;

    public ServiceRegistry(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    /** Stable id derived from baseUrl so a pod re-registering replaces itself. */
    static String deriveInstanceId(String baseUrl) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-1")
                .digest(baseUrl.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest).substring(0, 10);
        } catch (Exception e) {
            return Integer.toHexString(baseUrl.hashCode());
        }
    }

    public ServiceRegistration register(String serviceCode,
                                        String baseUrl,
                                        String healthUrl,
                                        String routePrefix,
                                        List<String> extraPaths,
                                        String version,
                                        String spaceTag) {
        Instant now = Instant.now();
        String instanceId = deriveInstanceId(baseUrl);
        String tag = (spaceTag != null && !spaceTag.isBlank()) ? spaceTag.trim() : null;
        ServiceRegistration reg = new ServiceRegistration(
            instanceId, serviceCode, baseUrl, healthUrl, routePrefix,
            extraPaths == null ? List.of() : List.copyOf(extraPaths),
            version != null ? version : "unknown",
            now, now, 0, tag
        );

        boolean firstForService = !byService.containsKey(serviceCode);
        ConcurrentHashMap<String, ServiceRegistration> pool =
            byService.computeIfAbsent(serviceCode, k -> new ConcurrentHashMap<>());
        boolean firstInstance = pool.put(instanceId, reg) == null;

        if (firstForService) {
            log.info("Service appeared: {} (first instance {} @ {})", serviceCode, instanceId, baseUrl);
            publisher.publishEvent(new RegistryEvents.ServiceAppearedEvent(this, serviceCode));
        } else if (firstInstance) {
            log.info("Instance registered: {}/{} v{} -> {}", serviceCode, instanceId, reg.version(), baseUrl);
        } else {
            log.info("Instance re-registered: {}/{} v{} -> {}", serviceCode, instanceId, reg.version(), baseUrl);
        }
        publisher.publishEvent(new RegistryEvents.InstanceRegisteredEvent(this, reg));
        return reg;
    }

    public boolean deregisterInstance(String serviceCode, String instanceId, String reason) {
        ConcurrentHashMap<String, ServiceRegistration> pool = byService.get(serviceCode);
        if (pool == null) return false;
        ServiceRegistration removed = pool.remove(instanceId);
        if (removed == null) return false;
        log.info("Instance removed: {}/{} ({})", serviceCode, instanceId, reason);
        publisher.publishEvent(new RegistryEvents.InstanceRemovedEvent(this, serviceCode, instanceId, reason));
        if (pool.isEmpty()) {
            byService.remove(serviceCode);
            counters.remove(serviceCode);
            log.info("Service disappeared: {} (no instances remain)", serviceCode);
            publisher.publishEvent(new RegistryEvents.ServiceDisappearedEvent(this, serviceCode));
        }
        return true;
    }

    /** Remove all instances of a service. */
    public int deregisterService(String serviceCode) {
        ConcurrentHashMap<String, ServiceRegistration> pool = byService.remove(serviceCode);
        if (pool == null) return 0;
        counters.remove(serviceCode);
        int count = pool.size();
        for (String instanceId : pool.keySet()) {
            publisher.publishEvent(new RegistryEvents.InstanceRemovedEvent(this, serviceCode, instanceId, "service-deregistered"));
        }
        log.info("Service deregistered: {} ({} instances removed)", serviceCode, count);
        publisher.publishEvent(new RegistryEvents.ServiceDisappearedEvent(this, serviceCode));
        return count;
    }

    /** Round-robin pick — no tag filtering (internal use / heartbeat). */
    public Optional<ServiceRegistration> pickInstance(String serviceCode) {
        return pickInstanceByTags(serviceCode, null, false);
    }

    /**
     * Round-robin pick with tag-based routing.
     *
     * @param serviceCode target service
     * @param requiredTags tags configured on the project space for this service (null/empty = no preference)
     * @param isolated if true, only tagged instances matching requiredTags; untagged excluded
     * @return selected instance or empty (→ 503)
     */
    public Optional<ServiceRegistration> pickInstanceByTags(String serviceCode,
                                                             java.util.Set<String> requiredTags,
                                                             boolean isolated) {
        ConcurrentHashMap<String, ServiceRegistration> pool = byService.get(serviceCode);
        if (pool == null || pool.isEmpty()) return Optional.empty();

        // 1. Health filter
        List<ServiceRegistration> healthy = new ArrayList<>(pool.size());
        for (ServiceRegistration reg : pool.values()) {
            if (reg.consecutiveFailures() == 0) healthy.add(reg);
        }
        List<ServiceRegistration> base = healthy.isEmpty() ? new ArrayList<>(pool.values()) : healthy;

        // 2. Tag filter
        List<ServiceRegistration> candidates;
        if (requiredTags == null || requiredTags.isEmpty()) {
            if (isolated) {
                // Isolated project with no tags for this service → no routing possible
                return Optional.empty();
            }
            // No tag preference → only untagged instances
            candidates = new ArrayList<>();
            for (ServiceRegistration reg : base) {
                if (reg.isUntagged()) candidates.add(reg);
            }
            // Fallback: if no untagged instances exist, use all (non-isolated only)
            if (candidates.isEmpty()) candidates = base;
        } else {
            // Has tag preference → pick instances whose tag matches any required tag
            List<ServiceRegistration> tagged = new ArrayList<>();
            List<ServiceRegistration> untagged = new ArrayList<>();
            for (ServiceRegistration reg : base) {
                if (reg.isUntagged()) {
                    untagged.add(reg);
                } else if (requiredTags.contains(reg.spaceTag())) {
                    tagged.add(reg);
                }
            }
            if (!tagged.isEmpty()) {
                candidates = tagged;
            } else if (!isolated && !untagged.isEmpty()) {
                // Non-isolated: fall back to untagged instances
                candidates = untagged;
            } else {
                return Optional.empty();
            }
        }

        if (candidates.isEmpty()) return Optional.empty();

        // 3. Round-robin
        AtomicInteger counter = counters.computeIfAbsent(serviceCode, k -> new AtomicInteger());
        int idx = Math.floorMod(counter.getAndIncrement(), candidates.size());
        return Optional.of(candidates.get(idx));
    }

    /** Available space tags per service (for admin UI). */
    public Map<String, List<String>> tagsByService() {
        Map<String, List<String>> result = new java.util.LinkedHashMap<>();
        for (var entry : byService.entrySet()) {
            List<String> tags = new ArrayList<>();
            for (ServiceRegistration reg : entry.getValue().values()) {
                if (!reg.isUntagged() && !tags.contains(reg.spaceTag())) {
                    tags.add(reg.spaceTag());
                }
            }
            tags.sort(String::compareTo);
            result.put(entry.getKey(), tags);
        }
        return result;
    }

    public Collection<ServiceRegistration> instancesOf(String serviceCode) {
        ConcurrentHashMap<String, ServiceRegistration> pool = byService.get(serviceCode);
        return pool == null ? List.of() : List.copyOf(pool.values());
    }

    public Collection<String> serviceCodes() {
        return List.copyOf(byService.keySet());
    }

    public Map<String, Collection<ServiceRegistration>> allInstancesByService() {
        Map<String, Collection<ServiceRegistration>> out = new java.util.LinkedHashMap<>();
        for (var e : byService.entrySet()) {
            out.put(e.getKey(), List.copyOf(e.getValue().values()));
        }
        return out;
    }

    /** Flat view of every instance across every service. */
    public Collection<ServiceRegistration> allInstances() {
        List<ServiceRegistration> out = new ArrayList<>();
        for (var pool : byService.values()) out.addAll(pool.values());
        return out;
    }

    public void markHeartbeat(String serviceCode, String instanceId, boolean ok) {
        ConcurrentHashMap<String, ServiceRegistration> pool = byService.get(serviceCode);
        if (pool == null) return;
        pool.computeIfPresent(instanceId, (k, reg) -> {
            boolean wasHealthy = reg.consecutiveFailures() == 0;
            int failures = ok ? 0 : reg.consecutiveFailures() + 1;
            Instant last  = ok ? Instant.now() : reg.lastHeartbeatOk();
            ServiceRegistration updated = reg.withHeartbeat(last, failures);
            boolean isHealthy = failures == 0;
            if (wasHealthy != isHealthy) {
                publisher.publishEvent(new RegistryEvents.HealthStatusChangedEvent(
                    this, serviceCode, instanceId, isHealthy));
            }
            return updated;
        });
    }

    public Optional<ServiceRegistration> getInstance(String serviceCode, String instanceId) {
        ConcurrentHashMap<String, ServiceRegistration> pool = byService.get(serviceCode);
        if (pool == null) return Optional.empty();
        return Optional.ofNullable(pool.get(instanceId));
    }
}
