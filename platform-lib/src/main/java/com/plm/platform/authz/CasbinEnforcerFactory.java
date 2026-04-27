package com.plm.platform.authz;

import org.casbin.jcasbin.main.Enforcer;
import org.casbin.jcasbin.model.Model;
import org.casbin.jcasbin.persist.Adapter;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Builds the shared Casbin {@link Enforcer} from the 6-field platform model
 * and a {@link DynamicPolicyAdapter} that projects the pno-hosted snapshot
 * into Casbin tuples.
 */
public final class CasbinEnforcerFactory {

    private CasbinEnforcerFactory() {}

    public static Enforcer build(Adapter adapter) throws IOException {
        String modelText = new ClassPathResource("casbin/plm_model.conf")
            .getContentAsString(StandardCharsets.UTF_8);

        Model model = new Model();
        model.loadModelFromText(modelText);

        Enforcer enforcer = new Enforcer(model, adapter);
        enforcer.enableAutoSave(false);
        return enforcer;
    }
}
