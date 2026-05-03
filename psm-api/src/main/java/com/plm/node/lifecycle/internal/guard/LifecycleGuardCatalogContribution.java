package com.plm.node.lifecycle.internal.guard;

import com.plm.algorithm.AlgorithmBean;
import com.plm.platform.action.AlgorithmCatalogContribution;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Contributes lifecycle guard algorithms to platform-api's registry at startup.
 * Collected by {@code ActionCatalogRegistrationClient} via the generic SPI.
 */
@Configuration
public class LifecycleGuardCatalogContribution implements AlgorithmCatalogContribution {

    private final List<LifecycleGuard> guards;

    public LifecycleGuardCatalogContribution(List<LifecycleGuard> guards) {
        this.guards = guards;
    }

    @Override
    public String typeId() { return "algtype-lifecycle-guard"; }

    @Override
    public String typeName() { return "Lifecycle Guard"; }

    @Override
    public String javaInterface() { return "LifecycleGuard"; }

    @Override
    public List<AlgorithmEntry> algorithms() {
        return guards.stream()
            .map(g -> new AlgorithmEntry(g.code(), labelOf(g), moduleOf(g)))
            .toList();
    }

    private static String labelOf(LifecycleGuard g) {
        AlgorithmBean ann = g.getClass().getAnnotation(AlgorithmBean.class);
        return (ann != null && !ann.name().isBlank()) ? ann.name() : g.code();
    }

    private static String moduleOf(LifecycleGuard g) {
        String[] parts = g.getClass().getPackageName().split("\\.");
        return parts.length > 2 ? parts[2] : "unknown";
    }
}
