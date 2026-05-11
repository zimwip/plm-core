package com.plm.platform.event;

import java.lang.annotation.*;

/**
 * Declares a NATS event emitted by a method.
 *
 * Apply to publisher methods (e.g. in {@code PlmEventPublisher}) to make the
 * service's event catalog self-describing. {@link com.plm.platform.action.ActionCatalogRegistrationClient}
 * scans all Spring beans for this annotation at startup and includes the catalog
 * in the registration payload sent to platform-api.
 *
 * <p>Subject convention: {@code global.{code}} for global scope,
 * {@code project.{psId}.users.{userId}.{code}} for user scope.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PlmEvent {

    /** NATS subject suffix — also the {@code event} field in the JSON payload. */
    String code();

    /** Human-readable description shown in the platform event catalog. */
    String description() default "";

    /**
     * Delivery scope.
     * <ul>
     *   <li>{@code global} — broadcast to all connected clients</li>
     *   <li>{@code user}   — targeted at the acting user only</li>
     *   <li>{@code service} — inter-service only (not forwarded to browser)</li>
     * </ul>
     */
    String scope() default "global";
}
