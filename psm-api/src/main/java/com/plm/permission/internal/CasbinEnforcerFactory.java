package com.plm.permission.internal;

import org.casbin.jcasbin.main.Enforcer;
import org.casbin.jcasbin.model.Model;
import org.jooq.DSLContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Produces the Casbin {@link Enforcer} bean wired to the authorization_policy table.
 */
@Configuration
class CasbinEnforcerFactory {

    @Bean
    Enforcer casbinEnforcer(DSLContext dsl) throws IOException {
        String modelText = new ClassPathResource("casbin/plm_model.conf")
            .getContentAsString(StandardCharsets.UTF_8);

        Model model = new Model();
        model.loadModelFromText(modelText);

        JooqPolicyAdapter adapter = new JooqPolicyAdapter(dsl);
        Enforcer enforcer = new Enforcer(model, adapter);
        enforcer.enableAutoSave(false);
        return enforcer;
    }
}
