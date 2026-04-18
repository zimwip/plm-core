package com.plm.domain.algorithm;

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
 * against DB rows to ensure consistency.
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

    /** Algorithm type code (e.g. "ACTION_GUARD", "LIFECYCLE_GUARD"). Documentation only. */
    String type() default "";
}
