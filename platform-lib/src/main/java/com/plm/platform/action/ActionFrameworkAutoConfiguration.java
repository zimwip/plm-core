package com.plm.platform.action;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.action.guard.ActionGuardPort;
import com.plm.platform.action.guard.PlmActionGuardAutoConfiguration;
import com.plm.platform.algorithm.AlgorithmRegistry;
import com.plm.platform.algorithm.AlgorithmRegistryAutoConfiguration;
import com.plm.platform.authz.AuthzContextProvider;
import com.plm.platform.authz.PermissionCatalogPort;
import com.plm.platform.authz.PolicyPort;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.ConfigRegistrationAutoConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;

/**
 * Wires {@link ActionDispatcher} and {@link ActionService} when all
 * auto-configured collaborators are present.
 *
 * User-provided beans ({@link ActionScopeRegistry}, {@link ActionNodeContextPort},
 * {@link ActionParameterValidatorPort}) are injected as constructor parameters —
 * Spring will fail fast if they are absent. Only auto-configured beans
 * ({@link ConfigCache}) are checked via {@code @ConditionalOnBean} so
 * simple services without ConfigCache don't get these beans wired.
 */
@AutoConfiguration(after = {
    ConfigRegistrationAutoConfiguration.class,
    AlgorithmRegistryAutoConfiguration.class,
    PlmActionGuardAutoConfiguration.class,
    PlmActionAutoConfiguration.class
})
@ConditionalOnBean(ConfigCache.class)
public class ActionFrameworkAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public ActionDispatcher actionDispatcher(
            ConfigCache configCache,
            AlgorithmRegistry algorithmRegistry,
            ActionScopeRegistry scopeRegistry,
            ActionNodeContextPort nodeContextPort,
            @Autowired(required = false) ActionParameterValidatorPort paramValidator) {
        return new ActionDispatcher(configCache, algorithmRegistry, scopeRegistry,
            nodeContextPort, paramValidator != null ? paramValidator : ActionParameterValidatorPort.NO_OP);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnBean({PolicyPort.class, PermissionCatalogPort.class,
                        ActionGuardPort.class, AuthzContextProvider.class})
    public ActionService actionService(
            ConfigCache configCache,
            PolicyPort policyService,
            PermissionCatalogPort permissionCatalog,
            ActionGuardPort actionGuardPort,
            AuthzContextProvider authzCtx,
            AlgorithmRegistry algorithmRegistry,
            ObjectMapper objectMapper) {
        return new ActionService(configCache, policyService, permissionCatalog,
            actionGuardPort, authzCtx, algorithmRegistry, objectMapper);
    }
}
