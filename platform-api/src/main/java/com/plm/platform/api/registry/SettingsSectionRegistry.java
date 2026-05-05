package com.plm.platform.api.registry;

import com.plm.platform.nats.PlmMessageBus;
import com.plm.platform.settings.dto.SettingSectionDto;
import com.plm.platform.settings.dto.SettingsRegisterRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory store of settings sections registered by each service.
 * Sections are lost on restart but re-registered by services within seconds (backoff).
 * Mutations publish {@code env.global.SETTINGS_CHANGED} on NATS so the
 * frontend (and future admin tooling) can refresh without polling.
 * <p>
 * Keyed by serviceCode. Only one registration per serviceCode is kept (latest wins).
 * If multiple instances of the same service register, they should declare the same sections.
 */
@Slf4j
@Component
public class SettingsSectionRegistry {

    private final ConcurrentHashMap<String, ServiceSettingsRegistration> byService = new ConcurrentHashMap<>();
    private final AtomicLong revision = new AtomicLong(0);
    private final ObjectProvider<PlmMessageBus> messageBusProvider;

    public SettingsSectionRegistry(ObjectProvider<PlmMessageBus> messageBusProvider) {
        this.messageBusProvider = messageBusProvider;
    }

    /**
     * Register (or replace) sections for a service.
     *
     * @return the stored registration
     */
    public ServiceSettingsRegistration register(SettingsRegisterRequest request) {
        Instant now = Instant.now();
        ServiceSettingsRegistration reg = new ServiceSettingsRegistration(
            request.serviceCode(),
            request.instanceId(),
            request.sections() == null ? List.of() : List.copyOf(request.sections()),
            now
        );

        ServiceSettingsRegistration prev = byService.put(request.serviceCode(), reg);
        if (prev == null) {
            log.info("Settings registered: {} ({} sections, instance {})",
                request.serviceCode(), reg.sections().size(), request.instanceId());
        } else {
            log.debug("Settings re-registered: {} ({} sections, instance {})",
                request.serviceCode(), reg.sections().size(), request.instanceId());
        }
        publishChange();
        return reg;
    }

    /**
     * Deregister a specific instance of a service.
     * Only removes if the stored instanceId matches.
     */
    public boolean deregisterInstance(String serviceCode, String instanceId) {
        ServiceSettingsRegistration current = byService.get(serviceCode);
        if (current == null) return false;
        if (instanceId.equals(current.instanceId())) {
            byService.remove(serviceCode);
            log.info("Settings deregistered: {} (instance {})", serviceCode, instanceId);
            publishChange();
            return true;
        }
        log.debug("Settings deregister skipped: {} (stored instance {} != requested {})",
            serviceCode, current.instanceId(), instanceId);
        return false;
    }

    /**
     * Remove all sections for a service regardless of instance.
     */
    public boolean deregister(String serviceCode) {
        ServiceSettingsRegistration removed = byService.remove(serviceCode);
        if (removed != null) {
            log.info("Settings deregistered (forced): {}", serviceCode);
            publishChange();
            return true;
        }
        return false;
    }

    public long revision() {
        return revision.get();
    }

    private void publishChange() {
        long rev = revision.incrementAndGet();
        PlmMessageBus bus = messageBusProvider.getIfAvailable();
        if (bus == null) return;
        try {
            bus.sendGlobal("SETTINGS_CHANGED", Map.of(
                "revision", rev,
                "changedAt", Instant.now().toString()
            ));
        } catch (Exception e) {
            log.warn("Failed to publish SETTINGS_CHANGED: {}", e.getMessage());
        }
    }

    /**
     * Flat list of all sections across all registered services.
     */
    public List<SettingSectionDto> getAllSections() {
        List<SettingSectionDto> all = new ArrayList<>();
        for (ServiceSettingsRegistration reg : byService.values()) {
            all.addAll(reg.sections());
        }
        return all;
    }

    /**
     * Sections for a single service.
     */
    public List<SettingSectionDto> getSectionsForService(String serviceCode) {
        ServiceSettingsRegistration reg = byService.get(serviceCode);
        return reg == null ? List.of() : reg.sections();
    }

    /**
     * All registrations (debug view).
     */
    public Collection<ServiceSettingsRegistration> allRegistrations() {
        return List.copyOf(byService.values());
    }
}
