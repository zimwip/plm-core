package com.plm.platform.action;

import java.util.List;

/**
 * SPI for services to contribute algorithm types and instances to platform-api's registry
 * without platform-lib needing to know about service-specific algorithm types.
 *
 * Each bean implementing this interface is collected by
 * {@link ActionCatalogRegistrationClient} and sent to platform-api at startup.
 */
public interface AlgorithmCatalogContribution {

    String typeId();
    String typeName();
    String javaInterface();
    List<AlgorithmEntry> algorithms();

    record AlgorithmEntry(String code, String label, String module) {}
}
