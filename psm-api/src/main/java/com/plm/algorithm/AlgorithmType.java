package com.plm.algorithm;

import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares an algorithm type on an interface.
 *
 * At startup, {@link AlgorithmStartupValidator} ensures a matching
 * {@code algorithm_type} row exists in the database. Missing types
 * are auto-registered.
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
