package com.plm.platform.client;

/**
 * Thrown when no healthy instance is available for a requested service.
 */
public class ServiceUnavailableException extends RuntimeException {

    private final String serviceCode;

    public ServiceUnavailableException(String serviceCode) {
        super("No available instance for service: " + serviceCode);
        this.serviceCode = serviceCode;
    }

    public String serviceCode() {
        return serviceCode;
    }
}
