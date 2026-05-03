package com.plm.platform.action;

import com.plm.platform.action.guard.ActionGuardPort;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.List;

/**
 * Auto-configuration for dynamic HTTP route registration from {@link ActionHandler#route()} declarations.
 *
 * Activates in servlet web applications when the service has a {@code spe.registration.service-code}
 * and at least one {@link ActionHandler} bean is present. Each handler that returns a non-empty
 * {@link ActionRouteDescriptor} from {@link ActionHandler#route()} gets its path registered
 * directly in Spring MVC's {@link RequestMappingHandlerMapping}.
 *
 * This means services do not need dedicated {@code @Controller} methods for actions that
 * declare their own HTTP binding — the handler's {@link ActionHandler#executeHttp} becomes
 * the actual MVC handler.
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnProperty(name = "platform.registration.service-code")
@ConditionalOnBean(ActionHandler.class)
public class ActionHandlerRouteAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public ActionHandlerRouteController actionHandlerRouteController(
            ObjectProvider<ActionGuardPort> guardPortProvider) {
        return new ActionHandlerRouteController(guardPortProvider.getIfAvailable());
    }

    @Bean
    @ConditionalOnMissingBean
    public ActionHandlerRouteRegistrar actionHandlerRouteRegistrar(
            @Qualifier("requestMappingHandlerMapping") RequestMappingHandlerMapping handlerMapping,
            ObjectProvider<ActionHandler> handlerProvider,
            ActionHandlerRouteController controller,
            @Value("${platform.registration.service-code}") String serviceCode) {

        List<ActionHandler> handlers = handlerProvider.orderedStream().toList();
        return new ActionHandlerRouteRegistrar(handlerMapping, handlers, controller, serviceCode);
    }
}
