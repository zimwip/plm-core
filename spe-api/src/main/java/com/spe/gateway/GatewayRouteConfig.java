package com.spe.gateway;

import com.spe.registry.ServiceRegistration;
import com.spe.registry.ServiceRegistry;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Flux;

/**
 * Dynamic RouteLocator: rebuilds routes from ServiceRegistry on each call.
 * CachingRouteLocator caches the result and is invalidated by RefreshRoutesEvent
 * published by RegistryRouteRefresher whenever the registry changes.
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
            for (ServiceRegistration svc : registry.all()) {
                rb.route("svc-" + svc.serviceCode(),
                    r -> r.path(svc.routePrefix()).uri(svc.baseUrl()));

                int i = 0;
                for (String extra : svc.extraPaths()) {
                    String pattern = extra.endsWith("/**") ? extra : (extra + "/**");
                    String id = "svc-" + svc.serviceCode() + "-extra-" + (i++);
                    rb.route(id, r -> r.path(pattern).uri(svc.baseUrl()));
                }
            }
            return rb.build().getRoutes();
        });
    }
}
