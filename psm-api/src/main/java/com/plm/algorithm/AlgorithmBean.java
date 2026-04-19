package com.plm.algorithm;

import org.springframework.stereotype.Component;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a Spring bean as an algorithm implementation.
 *
 * The {@link #code()} must match the {@code algorithm.code} column in the database.
 * At startup, {@link AlgorithmStartupValidator} cross-checks all annotated beans
 * against DB rows — missing algorithms are auto-registered.
 *
 * This annotation is meta-annotated with {@link Component}, so annotated classes
 * are automatically registered as Spring beans.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Component
public @interface AlgorithmBean {

    /** Must match {@code algorithm.code} in the database. */
    String code();

    /** Human-readable name. If empty, defaults to the simple class name. */
    String name() default "";

    /** Description. If empty, defaults to empty string in DB. */
    String description() default "";
}
