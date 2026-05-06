package com.plm.platform.algorithm;

import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares an algorithm type on an interface.
 *
 * {@code ActionCatalogRegistrationClient} discovers all {@link AlgorithmBean}-annotated
 * beans, finds this annotation on their implemented interfaces, and registers
 * the grouped contribution with platform-api automatically — no per-type
 * {@code AlgorithmCatalogContribution} class needed.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(AlgorithmType.List.class)
public @interface AlgorithmType {
    /** Stable ID for the algorithm_type row. */
    String id();
    /** Human-readable name. */
    String name();
    /** Description. */
    String description() default "";

    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    @interface List {
        AlgorithmType[] value();
    }
}
