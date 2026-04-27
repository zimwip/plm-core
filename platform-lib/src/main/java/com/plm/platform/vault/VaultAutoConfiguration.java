package com.plm.platform.vault;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.vault.core.VaultTemplate;

/**
 * Registers {@link VaultAdminClient} whenever Spring Cloud Vault has produced a
 * {@link VaultTemplate}. Explicit auto-configuration so the bean lands in services
 * whose component scan does not cover {@code com.plm.platform.vault}.
 */
@AutoConfiguration
@ConditionalOnBean(VaultTemplate.class)
public class VaultAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public VaultAdminClient vaultAdminClient(VaultTemplate vaultTemplate) {
        return new VaultAdminClient(vaultTemplate);
    }
}
