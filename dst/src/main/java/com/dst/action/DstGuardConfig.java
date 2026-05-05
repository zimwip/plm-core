package com.dst.action;

import com.plm.platform.action.guard.ActionGuardRegistration;
import com.plm.platform.action.guard.GuardEffect;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DstGuardConfig {

    @Bean
    public ActionGuardRegistration downloadGuards() {
        return ActionGuardRegistration.forAction("DOWNLOAD")
            .guard("dst_file_exists", GuardEffect.HIDE)
            .build();
    }

    @Bean
    public ActionGuardRegistration deleteGuards() {
        return ActionGuardRegistration.forAction("DELETE")
            .guard("dst_file_exists", GuardEffect.BLOCK)
            .build();
    }
}
