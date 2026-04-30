package com.plm.platform.spe.registry;

import com.plm.platform.spe.dto.RegistrySnapshot;
import com.plm.platform.spe.dto.ServiceInstanceInfo;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Client-side mirror of spe-api's ServiceRegistry. Populated by push
 * notifications from spe-api and an initial pull after registration.
 * Provides round-robin instance selection for {@code ServiceClient}.
 */
@Slf4j
public class LocalServiceRegistry {

    private volatile long snapshotVersion = -1;
    private final ConcurrentHashMap<String, List<ServiceInstanceInfo>> services = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();
    private final CountDownLatch populated = new CountDownLatch(1);

    /**
     * Replace local state from a registry snapshot.
     * Rejects stale snapshots (version <= current).
     */
    public synchronized void updateFromSnapshot(RegistrySnapshot snapshot) {
        if (snapshot.version() <= snapshotVersion) {
            log.debug("Ignoring stale snapshot v{} (current v{})", snapshot.version(), snapshotVersion);
            return;
        }
        snapshotVersion = snapshot.version();
        services.clear();
        if (snapshot.services() != null) {
            snapshot.services().forEach((code, instances) ->
                services.put(code, List.copyOf(instances)));
        }
        populated.countDown();
        log.debug("Registry updated to v{} ({} services)", snapshotVersion, services.size());
    }

    /**
     * Round-robin among healthy instances of the given service.
     * Falls back to all instances if none are healthy.
     *
     * @return selected instance, or empty if service unknown or no instances
     */
    public Optional<ServiceInstanceInfo> pickInstance(String serviceCode) {
        List<ServiceInstanceInfo> all = services.get(serviceCode);
        if (all == null || all.isEmpty()) return Optional.empty();

        List<ServiceInstanceInfo> healthy = new ArrayList<>(all.size());
        for (ServiceInstanceInfo info : all) {
            if (info.healthy()) healthy.add(info);
        }
        List<ServiceInstanceInfo> candidates = healthy.isEmpty() ? all : healthy;

        AtomicInteger counter = counters.computeIfAbsent(serviceCode, k -> new AtomicInteger());
        int idx = Math.floorMod(counter.getAndIncrement(), candidates.size());
        return Optional.of(candidates.get(idx));
    }

    /**
     * All known instances for a service (may include unhealthy).
     */
    public List<ServiceInstanceInfo> getInstances(String serviceCode) {
        return services.getOrDefault(serviceCode, List.of());
    }

    /**
     * Snapshot of every known service code. Used by federated aggregators
     * (resource / browse catalogs in platform-api) that need to fan out to
     * each registered service in parallel without keeping their own cache.
     */
    public java.util.Set<String> allServiceCodes() {
        return java.util.Set.copyOf(services.keySet());
    }

    /**
     * Whether at least one snapshot has been received.
     */
    public boolean isPopulated() {
        return snapshotVersion >= 0;
    }

    /**
     * Block until the registry is populated or timeout expires.
     *
     * @return true if populated, false if timed out
     */
    public boolean awaitPopulated(long timeout, TimeUnit unit) throws InterruptedException {
        return populated.await(timeout, unit);
    }

    /**
     * Current snapshot version (-1 if never populated).
     */
    public long snapshotVersion() {
        return snapshotVersion;
    }
}
