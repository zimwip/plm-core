package com.plm.platform.algorithm;

import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares a parameter for an algorithm implementation.
 *
 * Used on classes annotated with {@link AlgorithmBean} to declare
 * the parameter schema. At startup, {@code AlgorithmStartupValidator}
 * ensures matching rows exist in the config snapshot.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(AlgorithmParam.List.class)
public @interface AlgorithmParam {
    String name();
    String label() default "";
    String dataType() default "STRING";
    boolean required() default false;
    String defaultValue() default "";
    int displayOrder() default 0;

    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    @interface List {
        AlgorithmParam[] value();
    }
}
