package com.plm.platform.action;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.lang.reflect.Method;
import java.util.List;

/**
 * Registers Spring MVC routes for every {@link ActionHandler} that declares a {@link ActionRouteDescriptor}.
 *
 * Runs after all singleton beans are instantiated ({@link SmartInitializingSingleton}) so that
 * {@link RequestMappingHandlerMapping} is fully initialized before we add dynamic mappings.
 *
 * The handler's declared path (e.g. {@code /api/dst/data/{id}}) has the service context-path
 * prefix ({@code /api/<serviceCode>}) stripped before registration — Spring MVC receives the
 * path relative to the servlet context, which already excludes the context-path.
 */
public class ActionHandlerRouteRegistrar implements SmartInitializingSingleton {

    private static final Logger log = LoggerFactory.getLogger(ActionHandlerRouteRegistrar.class);

    private static final Method DISPATCH_METHOD;

    static {
        try {
            DISPATCH_METHOD = ActionHandlerRouteController.class
                .getMethod("dispatch", HttpServletRequest.class);
        } catch (NoSuchMethodException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    private final RequestMappingHandlerMapping handlerMapping;
    private final List<ActionHandler> actionHandlers;
    private final ActionHandlerRouteController controller;
    private final String contextPath;

    public ActionHandlerRouteRegistrar(
            RequestMappingHandlerMapping handlerMapping,
            List<ActionHandler> actionHandlers,
            ActionHandlerRouteController controller,
            String serviceCode) {
        this.handlerMapping = handlerMapping;
        this.actionHandlers = actionHandlers;
        this.controller = controller;
        this.contextPath = "/api/" + serviceCode;
    }

    @Override
    public void afterSingletonsInstantiated() {
        for (ActionHandler handler : actionHandlers) {
            handler.route()
                .filter(ActionRouteDescriptor::autoRegister)
                .ifPresent(route -> register(handler, route));
        }
    }

    private void register(ActionHandler handler, ActionRouteDescriptor route) {
        String fullPath = route.pathTemplate();
        String mvcPath = fullPath.startsWith(contextPath)
            ? fullPath.substring(contextPath.length())
            : fullPath;
        if (mvcPath.isEmpty()) mvcPath = "/";

        String routeKey = route.httpMethod() + ":" + mvcPath;
        controller.bind(routeKey, handler);

        RequestMappingInfo info = RequestMappingInfo
            .paths(mvcPath)
            .methods(RequestMethod.valueOf(route.httpMethod()))
            .options(handlerMapping.getBuilderConfiguration())
            .build();

        handlerMapping.registerMapping(info, controller, DISPATCH_METHOD);
        log.info("Action route registered: {} {} → {}", route.httpMethod(), mvcPath, handler.actionCode());
    }
}
