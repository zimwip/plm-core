package com.spe.registry;

import org.springframework.context.ApplicationEvent;

public class RegistryEvents {

    /** First instance of a service appeared (service becomes routable). */
    public static class ServiceAppearedEvent extends ApplicationEvent {
        private final String serviceCode;
        public ServiceAppearedEvent(Object source, String code) { super(source); this.serviceCode = code; }
        public String serviceCode() { return serviceCode; }
    }

    /** Last instance of a service went away (service becomes unroutable). */
    public static class ServiceDisappearedEvent extends ApplicationEvent {
        private final String serviceCode;
        public ServiceDisappearedEvent(Object source, String code) { super(source); this.serviceCode = code; }
        public String serviceCode() { return serviceCode; }
    }

    /** A single instance was added or updated. Does not change route set. */
    public static class InstanceRegisteredEvent extends ApplicationEvent {
        private final ServiceRegistration registration;
        public InstanceRegisteredEvent(Object source, ServiceRegistration reg) { super(source); this.registration = reg; }
        public ServiceRegistration registration() { return registration; }
    }

    /** A single instance was removed (explicit deregister or heartbeat eviction). */
    public static class InstanceRemovedEvent extends ApplicationEvent {
        private final String serviceCode;
        private final String instanceId;
        private final String reason;
        public InstanceRemovedEvent(Object source, String code, String instanceId, String reason) {
            super(source);
            this.serviceCode = code;
            this.instanceId = instanceId;
            this.reason = reason;
        }
        public String serviceCode() { return serviceCode; }
        public String instanceId() { return instanceId; }
        public String reason() { return reason; }
    }

    private RegistryEvents() {}
}
