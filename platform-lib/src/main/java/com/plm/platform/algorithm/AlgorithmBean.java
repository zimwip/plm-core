package com.plm.platform.algorithm;

import org.springframework.stereotype.Component;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a Spring bean as an algorithm implementation.
 *
 * The {@link #code()} must match the {@code algorithm.code} column in the database.
 * At startup, services cross-check annotated beans against their config source.
 *
 * Also acts as {@link Component} so annotated classes are Spring beans.
 * Discovered automatically by {@code ActionCatalogRegistrationClient} and contributed
 * to platform-api's algorithm registry grouped by {@link AlgorithmType}.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Component
public @interface AlgorithmBean {

    /** Must match {@code algorithm.code} in the database. */
    String code();

    /** Human-readable name. If empty, defaults to the code. */
    String name() default "";

    /** Description. */
    String description() default "";
}
