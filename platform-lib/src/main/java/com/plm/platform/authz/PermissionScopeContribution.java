package com.plm.platform.authz;

import com.plm.platform.authz.dto.ScopeRegistration;

/**
 * Service-supplied bean contributing one scope to the central pno registry.
 * Each service declares one bean per scope it owns.
 *
 * <p>Collected at boot by {@link PermissionScopeRegistrationClient} and posted
 * to {@code /api/pno/internal/scopes/register} as a batch.
 */
public interface PermissionScopeContribution {

    ScopeRegistration definition();
}
