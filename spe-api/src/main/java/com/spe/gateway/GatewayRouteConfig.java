package com.spe.gateway;

import com.plm.platform.spe.dto.ServiceInstanceInfo;
import com.plm.platform.spe.registry.LocalServiceRegistry;
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
                rb.route("svc-" + code, r -> r.path(routePrefix).uri(lbUri));
            }
            return rb.build().getRoutes();
        });
    }
}
