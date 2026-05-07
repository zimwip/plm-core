package com.plm.platform;

/**
 * Base class for all PLM service application classes.
 * Allows {@code AlgorithmRegistry} to discover the service's root package
 * for Spring Modulith scanning without a hard reference to any specific application class.
 */
public abstract class PlatformService {
}
