package com.plm.platform.nats;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "plm.nats")
public class NatsProperties {

    private boolean enabled = false;
    private String url = "nats://nats:4222";
    private String connectionName;
    private long reconnectWaitMs = 2000;
    private int maxReconnects = -1; // infinite

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getConnectionName() { return connectionName; }
    public void setConnectionName(String connectionName) { this.connectionName = connectionName; }

    public long getReconnectWaitMs() { return reconnectWaitMs; }
    public void setReconnectWaitMs(long reconnectWaitMs) { this.reconnectWaitMs = reconnectWaitMs; }

    public int getMaxReconnects() { return maxReconnects; }
    public void setMaxReconnects(int maxReconnects) { this.maxReconnects = maxReconnects; }
}
