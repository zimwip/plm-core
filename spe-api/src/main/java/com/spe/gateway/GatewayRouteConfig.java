package com.spe.gateway;

import com.plm.platform.action.dto.ServiceInstanceInfo;
import com.plm.platform.registry.LocalServiceRegistry;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Flux;

import java.net.URI;
import java.util.List;

/**
 * Dynamic RouteLocator: one route per {@code serviceCode} (not per instance).
 * The URI uses the custom {@code svc://} scheme; {@link SvcLoadBalancerFilter}
 * rewrites it per-request to a concrete instance picked round-robin from the
 * local registry.
 *
 * <p>Each route applies {@code StripPrefix=2} so the gateway removes the
 * {@code /api/<serviceCode>} prefix before forwarding: the gateway owns route
 * segregation and backends serve at root (gateway-strip routing). e.g.
 * {@code /api/psm/nodes} is forwarded as {@code /nodes}. The
 * {@link AuthenticationFilter} runs earlier (pre-routing) and still sees the
 * full {@code /api/<code>} path for exemption matching + service-code gating.
 *
 * <p>Routes come from {@link LocalServiceRegistry}, which is populated by
 * the {@code EnvironmentSubscriber} (NATS-notify-then-HTTP-pull from
 * platform-api). CachingRouteLocator caches and is invalidated by the
 * {@link RegistryRouteRefresher} on environment change.
 */
@Configuration
public class GatewayRouteConfig {

    private final LocalServiceRegistry registry;
    private final RouteLocatorBuilder builder;

    public GatewayRouteConfig(LocalServiceRegistry registry, RouteLocatorBuilder builder) {
        this.registry = registry;
        this.builder = builder;
    }

    @Bean
    public RouteLocator dynamicRoutes() {
        return () -> Flux.defer(() -> {
            RouteLocatorBuilder.Builder rb = builder.routes();
            for (String code : registry.allServiceCodes()) {
                List<ServiceInstanceInfo> instances = registry.getInstances(code);
                if (instances.isEmpty()) continue;
                URI lbUri = URI.create("svc://" + code);
                String routePrefix = "/api/" + code + "/**";
                // StripPrefix=2 drops /api and /<code> so the backend receives a
                // root-relative path (the gateway owns the /api/<code> prefix).
                rb.route("svc-" + code, r -> r.path(routePrefix).filters(f -> f.stripPrefix(2)).uri(lbUri));
            }
            return rb.build().getRoutes();
        });
    }
}
