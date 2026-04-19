package com.plm;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModularArchitectureTest {

    ApplicationModules modules = ApplicationModules.of(PlmApplication.class);

    @Test
    void verifyModuleStructure() {
        modules.verify();
    }

    @Test
    void printModules() {
        modules.forEach(System.out::println);
    }
}
