package com.spe.gateway;

import com.spe.registry.ServiceRegistration;
import com.spe.registry.ServiceRegistry;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Flux;

import java.net.URI;
import java.util.Collection;

/**
 * Dynamic RouteLocator: one route per {@code serviceCode} (not per instance).
 * The URI uses the custom {@code svc://} scheme; {@link SvcLoadBalancerFilter}
 * rewrites it per-request to a concrete instance picked round-robin from the
 * registry.
 *
 * CachingRouteLocator caches the result and is invalidated by RefreshRoutesEvent
 * published by RegistryRouteRefresher when a service appears / disappears.
 */
@Configuration
public class GatewayRouteConfig {

    private final ServiceRegistry registry;
    private final RouteLocatorBuilder builder;

    public GatewayRouteConfig(ServiceRegistry registry, RouteLocatorBuilder builder) {
        this.registry = registry;
        this.builder = builder;
    }

    @Bean
    public RouteLocator dynamicRoutes() {
        return () -> Flux.defer(() -> {
            RouteLocatorBuilder.Builder rb = builder.routes();
            for (String code : registry.serviceCodes()) {
                Collection<ServiceRegistration> instances = registry.instancesOf(code);
                if (instances.isEmpty()) continue;
                // Route metadata (routePrefix, extraPaths) is taken from any instance —
                // all instances of a service declare the same routing shape.
                ServiceRegistration any = instances.iterator().next();
                URI lbUri = URI.create("svc://" + code);

                rb.route("svc-" + code,
                    r -> r.path(any.routePrefix()).uri(lbUri));

                int i = 0;
                for (String extra : any.extraPaths()) {
                    String pattern = extra.endsWith("/**") ? extra : (extra + "/**");
                    String id = "svc-" + code + "-extra-" + (i++);
                    rb.route(id, r -> r.path(pattern).uri(lbUri));
                }
            }
            return rb.build().getRoutes();
        });
    }
}
