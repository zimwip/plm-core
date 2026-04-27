package com.plm.platform.authz;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares how to extract one scope key value at a {@link PlmPermission} site.
 *
 * <p>The {@code name} must match a key declared by the scope's
 * {@link com.plm.platform.authz.dto.ScopeRegistration} (e.g. {@code "nodeType"},
 * {@code "transition"}). The {@code expr} is a SpEL expression evaluated against
 * method parameters.
 *
 * <p>Raw values are passed through {@link ScopeKeyResolver} instances registered
 * for the scope so annotations can reference a surrogate parameter (e.g. a
 * {@code nodeId}) and let the resolver compute the real key value (e.g. the
 * nodeType of that node).
 */
@Target({})
@Retention(RetentionPolicy.RUNTIME)
public @interface KeyExpr {
    String name();
    String expr();
}
