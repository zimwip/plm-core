package com.plm.platform.authz;

/**
 * Bridge between the service's request-scope security context and the
 * platform-lib enforcer. Services implement one bean; the aspect + enforcer
 * depend only on this interface.
 */
public interface AuthzContextProvider {

    /** Returns the current context, or {@code null} when no user is bound. */
    AuthzContext currentOrNull();

    /** Returns the current context; throws if no user is bound. */
    AuthzContext current();
}
