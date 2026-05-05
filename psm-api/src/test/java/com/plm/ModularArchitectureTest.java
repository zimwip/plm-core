package com.plm;

import com.tngtech.archunit.core.domain.JavaClass;
import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModularArchitectureTest {

    // Exclude platform-lib classes (com.plm.platform.*) from module analysis.
    // They are external library types, not Modulith modules — treating them as
    // modules would flag every dependency on their sub-packages as a violation.
    ApplicationModules modules = ApplicationModules.of(PlmApplication.class,
        JavaClass.Predicates.resideInAPackage("com.plm.platform.."));

    @Test
    void verifyModuleStructure() {
        modules.verify();
    }

    @Test
    void printModules() {
        modules.forEach(System.out::println);
    }
}
