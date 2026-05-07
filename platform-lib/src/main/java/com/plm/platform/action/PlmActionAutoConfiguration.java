package com.plm.platform.action;

import com.plm.platform.action.guard.ActionGuardPort;
import com.plm.platform.action.guard.PlmActionGuardAutoConfiguration;
import com.plm.platform.authz.AuthzContextProvider;
import com.plm.platform.authz.PermissionCatalogPort;
import com.plm.platform.authz.PolicyPort;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.ConfigRegistrationAutoConfiguration;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;

import java.util.List;

/**
 * Auto-configuration for {@link PlmActionAspect} and {@link ActionScopeRegistry}.
 *
 * {@link ActionScopeRegistry} is always created when ActionScope beans are present.
 * {@link PlmActionAspect} activates only when the consuming service provides
 * an {@link ActionNodeContextPort} bean (i.e. services that own node data).
 */
@AutoConfiguration(after = {ConfigRegistrationAutoConfiguration.class, PlmActionGuardAutoConfiguration.class})
public class PlmActionAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public ActionScopeRegistry actionScopeRegistry(List<ActionScope> scopes) {
        return new ActionScopeRegistry(scopes);
    }

    @Bean
    @ConditionalOnBean(ConfigCache.class)
    public PlmActionValidator plmActionValidator(ApplicationContext ctx, ConfigCache configCache) {
        return new PlmActionValidator(ctx, configCache);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnBean({ActionNodeContextPort.class, ConfigCache.class, PolicyPort.class,
                        PermissionCatalogPort.class, ActionGuardPort.class, AuthzContextProvider.class})
    public PlmActionAspect plmActionAspect(
            ConfigCache configCache,
            PolicyPort policyService,
            PermissionCatalogPort permissionCatalog,
            ActionGuardPort actionGuardPort,
            AuthzContextProvider authz,
            ActionScopeRegistry scopeRegistry,
            ActionNodeContextPort nodeContextPort) {
        return new PlmActionAspect(configCache, policyService, permissionCatalog,
            actionGuardPort, authz, scopeRegistry, nodeContextPort);
    }
}
