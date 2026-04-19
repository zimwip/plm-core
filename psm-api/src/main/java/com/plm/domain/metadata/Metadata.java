package com.plm.domain.metadata;

import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares that a class uses a specific metadata key on a given target type.
 *
 * At startup, {@link MetadataRegistry} discovers all beans annotated with
 * {@code @Metadata} and builds a catalog of known metadata keys per target
 * type. This catalog is exposed via API so the frontend can dynamically
 * render metadata toggles.
 *
 * <pre>
 * {@literal @}Metadata(key = "frozen", target = "LIFECYCLE_STATE",
 *          description = "Blocks content modifications (checkout, attribute changes)")
 * public class NotFrozenGuard implements Guard { ... }
 * </pre>
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(Metadata.List.class)
public @interface Metadata {

    /** The metadata key (e.g. "frozen", "released"). */
    String key();

    /** The target type this key applies to (e.g. "LIFECYCLE_STATE"). */
    String target();

    /** Human-readable description shown in the admin UI. */
    String description() default "";

    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    @interface List {
        Metadata[] value();
    }
}
