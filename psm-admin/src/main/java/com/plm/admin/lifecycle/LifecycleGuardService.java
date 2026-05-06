package com.plm.admin.lifecycle;

import com.plm.admin.config.ConfigChangedEvent;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class LifecycleGuardService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;
    private final RestTemplate rest;
    private final String platformUrl;
    private final String serviceSecret;

    public LifecycleGuardService(DSLContext dsl, ApplicationEventPublisher eventPublisher,
                                 RestTemplateBuilder restBuilder,
                                 @Value("${plm.settings.settings-url:http://platform-api:8084}") String platformUrl,
                                 @Value("${plm.auth.service-secret:}") String serviceSecret) {
        this.dsl            = dsl;
        this.eventPublisher = eventPublisher;
        this.rest           = restBuilder.build();
        this.platformUrl    = platformUrl;
        this.serviceSecret  = serviceSecret;
    }

    public List<Map<String, Object>> listGuards(String transitionId) {
        List<Record> rows = dsl.fetch(
            "SELECT id, lifecycle_transition_id, algorithm_instance_id, effect, display_order " +
            "FROM lifecycle_transition_guard WHERE lifecycle_transition_id = ? ORDER BY display_order",
            transitionId);

        Map<String, Map<String, Object>> instanceIndex = fetchInstanceIndex();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Record r : rows) {
            String instId = r.get("algorithm_instance_id", String.class);
            Map<String, Object> inst = instanceIndex.getOrDefault(instId, Map.of());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",                    r.get("id", String.class));
            m.put("lifecycleTransitionId", r.get("lifecycle_transition_id", String.class));
            m.put("algorithmInstanceId",   instId);
            m.put("effect",                r.get("effect", String.class));
            m.put("displayOrder",          r.get("display_order", Integer.class));
            m.put("instanceName",          inst.get("name"));
            m.put("algorithmCode",         inst.get("algorithmCode"));
            m.put("algorithmName",         inst.get("algorithmName"));
            m.put("moduleName",            inst.get("moduleName"));
            m.put("typeName",              inst.get("typeName"));
            result.add(m);
        }
        return result;
    }

    @Transactional
    public String attachGuard(String transitionId, String instanceId, String effect, int displayOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle_transition_guard " +
            "(id, lifecycle_transition_id, algorithm_instance_id, effect, display_order) VALUES (?,?,?,?,?)",
            id, transitionId, instanceId, effect, displayOrder);
        eventPublisher.publishEvent(new ConfigChangedEvent("CREATE", "LIFECYCLE_TRANSITION_GUARD", id));
        return id;
    }

    @Transactional
    public void updateGuardEffect(String guardId, String effect) {
        if (effect == null || (!effect.equals("HIDE") && !effect.equals("BLOCK")))
            throw new IllegalArgumentException("effect must be HIDE or BLOCK");
        dsl.execute("UPDATE lifecycle_transition_guard SET effect = ? WHERE id = ?", effect, guardId);
        eventPublisher.publishEvent(new ConfigChangedEvent("UPDATE", "LIFECYCLE_TRANSITION_GUARD", guardId));
    }

    @Transactional
    public void detachGuard(String guardId) {
        dsl.execute("DELETE FROM lifecycle_transition_guard WHERE id = ?", guardId);
        eventPublisher.publishEvent(new ConfigChangedEvent("DELETE", "LIFECYCLE_TRANSITION_GUARD", guardId));
    }

    private Map<String, Map<String, Object>> fetchInstanceIndex() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", serviceSecret);
            var resp = rest.exchange(
                platformUrl + "/api/platform/internal/algorithms/instances",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            List<Map<String, Object>> instances = resp.getBody();
            if (instances == null) return Map.of();
            Map<String, Map<String, Object>> idx = new LinkedHashMap<>();
            for (Map<String, Object> inst : instances)
                if (inst.get("id") instanceof String id) idx.put(id, inst);
            return idx;
        } catch (Exception e) {
            log.warn("Failed to fetch algorithm instances from platform-api: {}", e.getMessage());
            return Map.of();
        }
    }
}
