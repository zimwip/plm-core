package com.plm.platform.algorithm;

import com.plm.platform.algorithm.dto.AlgorithmRegistrationRequest;

/**
 * Implemented by services that own @AlgorithmBean classes (e.g. psm-api).
 * The platform-lib AlgorithmRegistrationClient calls {@link #buildCatalog()}
 * at startup and POSTs the result to psm-admin.
 *
 * <p>Services without algorithm beans simply do not declare a provider — the
 * registration client is then a no-op.
 */
public interface AlgorithmCatalogProvider {
    AlgorithmRegistrationRequest buildCatalog();
}
