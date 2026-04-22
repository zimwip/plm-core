package com.spe.registry;

import org.springframework.context.ApplicationEvent;

public class RegistryEvents {

    public static class ServiceRegisteredEvent extends ApplicationEvent {
        private final ServiceRegistration registration;
        public ServiceRegisteredEvent(Object source, ServiceRegistration reg) { super(source); this.registration = reg; }
        public ServiceRegistration registration() { return registration; }
    }

    public static class ServiceDeregisteredEvent extends ApplicationEvent {
        private final String serviceCode;
        public ServiceDeregisteredEvent(Object source, String code) { super(source); this.serviceCode = code; }
        public String serviceCode() { return serviceCode; }
    }

    private RegistryEvents() {}
}
