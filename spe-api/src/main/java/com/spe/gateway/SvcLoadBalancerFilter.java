package com.spe.gateway;

import com.spe.auth.AuthenticationFilter;
import com.spe.auth.ProjectSpaceTagClient;
import com.spe.auth.ProjectSpaceTagClient.ProjectSpaceTagConfig;
import com.spe.auth.SpeUserContext;
import com.spe.registry.ServiceRegistration;
import com.spe.registry.ServiceRegistry;
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
import java.util.Optional;
import java.util.Set;

/**
 * Resolves {@code svc://<serviceCode>} URIs set by {@link GatewayRouteConfig} to a
 * concrete instance picked round-robin from {@link ServiceRegistry}. Uses project
 * space service tag configuration for affinity routing.
 *
 * Runs before {@code NettyRoutingFilter} (order 10150) so the routing filter
 * sees a real http(s):// URL.
 */
@Slf4j
@Component
public class SvcLoadBalancerFilter implements GlobalFilter, Ordered {

    public static final String SCHEME = "svc";
    private static final int ORDER = 10150;

    private final ServiceRegistry registry;
    private final ProjectSpaceTagClient tagClient;

    public SvcLoadBalancerFilter(ServiceRegistry registry, ProjectSpaceTagClient tagClient) {
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

        // Extract project space
        String projectSpaceId = null;
        SpeUserContext ctx = exchange.getAttribute(AuthenticationFilter.CONTEXT_ATTR);
        if (ctx != null) {
            projectSpaceId = ctx.projectSpaceId();
        }
        if (projectSpaceId == null) {
            projectSpaceId = exchange.getRequest().getHeaders().getFirst("X-PLM-ProjectSpace");
        }

        // Fetch tag config (cached, reactive) and pick instance
        final String psId = projectSpaceId;
        return tagClient.getTagConfig(projectSpaceId)
            .flatMap(tagConfig -> {
                Set<String> requiredTags = tagConfig.tagsForService(serviceCode);
                Optional<ServiceRegistration> pick = registry.pickInstanceByTags(
                    serviceCode, requiredTags, tagConfig.isolated());

                if (pick.isEmpty()) {
                    log.warn("No instance for service {} (ps={}, tags={}, isolated={})",
                        serviceCode, psId, requiredTags, tagConfig.isolated());
                    return Mono.error(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "No instance available for service " + serviceCode
                            + (psId != null ? " (projectSpace=" + psId + ")" : "")));
                }

                ServiceRegistration instance = pick.get();
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
}
