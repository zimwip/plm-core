package com.plm.platform.authz;

import com.plm.platform.nats.NatsListenerFactory;
import com.plm.platform.spe.client.ServiceClient;
import com.plm.platform.spe.client.ServiceClientAutoConfiguration;
import io.nats.client.Dispatcher;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.aspectj.lang.ProceedingJoinPoint;
import org.casbin.jcasbin.main.Enforcer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Wires the platform-lib enforcer stack ({@link Enforcer},
 * {@link DynamicPolicyAdapter}, {@link ScopeDefinitionCache},
 * {@link PermissionPolicySnapshotClient}, {@link DefaultPolicyEnforcer},
 * {@link PlmPermissionAspect}, {@link PlmPermissionValidator}) when a service
 * opts in via {@code plm.permission.enabled=true} AND provides an
 * {@link AuthzContextProvider} + {@link PermissionCatalogPort} bean.
 */
@AutoConfiguration(after = ServiceClientAutoConfiguration.class)
@ConditionalOnProperty(prefix = "plm.permission", name = "enabled", havingValue = "true")
@ConditionalOnClass({Enforcer.class, ProceedingJoinPoint.class})
public class PlatformAuthzAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public ScopeDefinitionCache scopeDefinitionCache() {
        return new ScopeDefinitionCache();
    }

    @Bean
    @ConditionalOnMissingBean
    public DynamicPolicyAdapter dynamicPolicyAdapter(ScopeDefinitionCache scopes) {
        return new DynamicPolicyAdapter(scopes);
    }

    @Bean
    @ConditionalOnMissingBean
    public Enforcer casbinEnforcer(DynamicPolicyAdapter adapter) throws IOException {
        return CasbinEnforcerFactory.build(adapter);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnBean(ServiceClient.class)
    public PermissionPolicySnapshotClient permissionPolicySnapshotClient(
            ServiceClient serviceClient,
            DynamicPolicyAdapter adapter,
            ScopeDefinitionCache scopes,
            Enforcer enforcer) {
        return new PermissionPolicySnapshotClient(serviceClient, adapter, scopes, enforcer);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnBean({AuthzContextProvider.class, PermissionPolicySnapshotClient.class})
    public PolicyEnforcer policyEnforcer(Enforcer enforcer,
                                         ScopeDefinitionCache scopes,
                                         AuthzContextProvider authz,
                                         PermissionPolicySnapshotClient snapshotClient) {
        return new DefaultPolicyEnforcer(enforcer, scopes, authz, snapshotClient);
    }

    @Bean
    @ConditionalOnMissingBean
    public ChainedScopeKeyResolver chainedScopeKeyResolver(
            ScopeDefinitionCache scopes,
            ObjectProvider<List<ScopeKeyResolver>> resolvers) {
        return new ChainedScopeKeyResolver(scopes, resolvers.getIfAvailable(Collections::emptyList));
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnBean({PolicyEnforcer.class, PermissionCatalogPort.class, AuthzContextProvider.class})
    public PlmPermissionAspect plmPermissionAspect(PolicyEnforcer enforcer,
                                                   PermissionCatalogPort catalog,
                                                   AuthzContextProvider authz,
                                                   ChainedScopeKeyResolver chained) {
        return new PlmPermissionAspect(enforcer, catalog, authz, chained);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnBean(PermissionCatalogPort.class)
    public PlmPermissionValidator plmPermissionValidator(ApplicationContext ctx,
                                                         PermissionCatalogPort catalog,
                                                         ScopeDefinitionCache scopes) {
        return new PlmPermissionValidator(ctx, catalog, scopes);
    }

    /**
     * Kick the first snapshot load once the context is fully refreshed. The
     * snapshot client swallows transient errors so subsequent calls to
     * {@link PolicyEnforcer#reload()} pick it up eventually.
     */
    @Bean
    @ConditionalOnBean(PermissionPolicySnapshotClient.class)
    public AuthzSnapshotBootstrapper authzSnapshotBootstrapper(PermissionPolicySnapshotClient client) {
        return new AuthzSnapshotBootstrapper(client);
    }

    /** Thin component that triggers the initial reload on context refresh. */
    public static class AuthzSnapshotBootstrapper {
        private final PermissionPolicySnapshotClient client;
        public AuthzSnapshotBootstrapper(PermissionPolicySnapshotClient client) { this.client = client; }
        @EventListener(ContextRefreshedEvent.class)
        public void onReady() { client.reload(); }
    }

    /**
     * Subscribes to {@code global.AUTHORIZATION_CHANGED} on NATS and triggers
     * {@link PermissionPolicySnapshotClient#reload()} when admin actions on
     * pno-api change scopes / grants. Without this every consumer would only
     * see policy changes after a process restart.
     */
    @Bean
    @ConditionalOnBean({PermissionPolicySnapshotClient.class, NatsListenerFactory.class})
    public AuthzChangeSubscriber authzChangeSubscriber(NatsListenerFactory natsListeners,
                                                        PermissionPolicySnapshotClient client) {
        return new AuthzChangeSubscriber(natsListeners, client);
    }

    public static class AuthzChangeSubscriber {
        private static final Logger log = LoggerFactory.getLogger(AuthzChangeSubscriber.class);
        private static final String SUBJECT = "global.AUTHORIZATION_CHANGED";

        private final NatsListenerFactory natsListeners;
        private final PermissionPolicySnapshotClient client;
        private Dispatcher dispatcher;

        public AuthzChangeSubscriber(NatsListenerFactory natsListeners,
                                     PermissionPolicySnapshotClient client) {
            this.natsListeners = natsListeners;
            this.client = client;
        }

        @PostConstruct
        public void subscribe() {
            dispatcher = natsListeners.subscribe(SUBJECT, msg -> {
                log.info("Authorization snapshot reload triggered by {}", SUBJECT);
                try {
                    client.reload();
                } catch (Exception e) {
                    log.warn("Authorization snapshot reload failed: {}", e.getMessage());
                }
            });
        }

        @PreDestroy
        public void shutdown() {
            if (dispatcher != null) {
                try {
                    natsListeners.close(dispatcher);
                } catch (Exception ignored) { /* best effort */ }
            }
        }
    }
}
