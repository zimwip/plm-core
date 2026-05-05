package com.spe.gateway;

import com.plm.platform.spe.dto.ServiceInstanceInfo;
import com.plm.platform.spe.registry.LocalServiceRegistry;
import com.spe.auth.AuthenticationFilter;
import com.spe.auth.ProjectSpaceTagClient;
import com.spe.auth.SpeUserContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Resolves {@code svc://<serviceCode>} URIs set by {@link GatewayRouteConfig}
 * to a concrete instance picked round-robin from {@link LocalServiceRegistry}.
 * Uses project space service tag configuration for affinity routing.
 *
 * <p>Runs before {@code NettyRoutingFilter} (order 10150) so the routing
 * filter sees a real http(s):// URL.
 */
@Slf4j
@Component
public class SvcLoadBalancerFilter implements GlobalFilter, Ordered {

    public static final String SCHEME = "svc";
    private static final int ORDER = 10150;

    private final LocalServiceRegistry registry;
    private final ProjectSpaceTagClient tagClient;
    private final ConcurrentHashMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();

    public SvcLoadBalancerFilter(LocalServiceRegistry registry, ProjectSpaceTagClient tagClient) {
        this.registry = registry;
        this.tagClient = tagClient;
    }

    @Override public int getOrder() { return ORDER; }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        URI requestUrl = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR);
        if (requestUrl == null || !SCHEME.equals(requestUrl.getScheme())) {
            return chain.filter(exchange);
        }
        String serviceCode = requestUrl.getHost();

        String projectSpaceId = null;
        SpeUserContext ctx = exchange.getAttribute(AuthenticationFilter.CONTEXT_ATTR);
        if (ctx != null) {
            projectSpaceId = ctx.projectSpaceId();
        }
        if (projectSpaceId == null) {
            projectSpaceId = exchange.getRequest().getHeaders().getFirst("X-PLM-ProjectSpace");
        }

        final String psId = projectSpaceId;
        return tagClient.getTagConfig(projectSpaceId)
            .flatMap(tagConfig -> {
                Set<String> requiredTags = tagConfig.tagsForService(serviceCode);
                Optional<ServiceInstanceInfo> pick = pickInstanceByTags(serviceCode, requiredTags, tagConfig.isolated());

                if (pick.isEmpty()) {
                    log.warn("No instance for service {} (ps={}, tags={}, isolated={})",
                        serviceCode, psId, requiredTags, tagConfig.isolated());
                    return Mono.error(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "No instance available for service " + serviceCode
                            + (psId != null ? " (projectSpace=" + psId + ")" : "")));
                }

                ServiceInstanceInfo instance = pick.get();
                URI instanceBase = URI.create(instance.baseUrl());
                try {
                    URI rewritten = new URI(
                        instanceBase.getScheme(),
                        requestUrl.getUserInfo(),
                        instanceBase.getHost(),
                        instanceBase.getPort(),
                        requestUrl.getRawPath(),
                        requestUrl.getRawQuery(),
                        requestUrl.getRawFragment()
                    );
                    exchange.getAttributes().put(ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR, rewritten);
                    exchange.getAttributes().put("spe.instanceId", instance.instanceId());
                    if (log.isDebugEnabled()) {
                        log.debug("svc://{} [ps={}, tag={}] -> {} (instance {})",
                            serviceCode, psId, instance.spaceTag(), rewritten, instance.instanceId());
                    }
                } catch (URISyntaxException e) {
                    return Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Invalid rewritten URI for " + serviceCode));
                }
                return chain.filter(exchange);
            });
    }

    /**
     * Tag-aware round-robin pick.
     *
     * <p>The base {@link LocalServiceRegistry#pickInstance} is health-aware
     * but tag-blind. The gateway must honor project-space tag affinity,
     * which today's LocalServiceRegistry does not encode — so we re-derive
     * the same logic spe-api owned previously.
     */
    private Optional<ServiceInstanceInfo> pickInstanceByTags(String serviceCode,
                                                             Set<String> requiredTags,
                                                             boolean isolated) {
        List<ServiceInstanceInfo> all = registry.getInstances(serviceCode);
        if (all.isEmpty()) return Optional.empty();

        List<ServiceInstanceInfo> healthy = all.stream().filter(ServiceInstanceInfo::healthy).toList();
        List<ServiceInstanceInfo> base = healthy.isEmpty() ? all : healthy;

        List<ServiceInstanceInfo> candidates;
        if (requiredTags == null || requiredTags.isEmpty()) {
            if (isolated) return Optional.empty();
            candidates = base.stream().filter(i -> isUntagged(i.spaceTag())).toList();
            if (candidates.isEmpty()) candidates = base;
        } else {
            List<ServiceInstanceInfo> tagged = base.stream()
                .filter(i -> !isUntagged(i.spaceTag()) && requiredTags.contains(i.spaceTag()))
                .toList();
            List<ServiceInstanceInfo> untagged = base.stream()
                .filter(i -> isUntagged(i.spaceTag()))
                .toList();
            if (!tagged.isEmpty()) candidates = tagged;
            else if (!isolated && !untagged.isEmpty()) candidates = untagged;
            else return Optional.empty();
        }

        if (candidates.isEmpty()) return Optional.empty();
        AtomicInteger counter = counters.computeIfAbsent(serviceCode, k -> new AtomicInteger());
        int idx = Math.floorMod(counter.getAndIncrement(), candidates.size());
        return Optional.of(candidates.get(idx));
    }

    private static boolean isUntagged(String tag) {
        return tag == null || tag.isBlank();
    }
}
