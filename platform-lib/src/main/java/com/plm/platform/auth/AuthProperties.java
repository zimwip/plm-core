package com.plm.platform.auth;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for the shared {@link PlmAuthFilter}.
 *
 * Matched path patterns use Spring's AntPathMatcher, applied after the
 * context-path prefix is stripped from the request URI.
 */
@ConfigurationProperties(prefix = "plm.auth")
public class AuthProperties {

    /** Paths that bypass all authentication (actuator, swagger, etc). */
    private List<String> publicPaths = List.of("/actuator/**", "/v3/api-docs/**", "/swagger-ui/**");

    /** Paths that require a matching X-Service-Secret header instead of a JWT. */
    private List<String> secretPaths = List.of("/internal/**");

    /** Shared HMAC secret used for JWT verification and X-Service-Secret comparison. */
    private String serviceSecret;

    /** Allowed clock skew on JWT exp/nbf checks. */
    private long clockSkewSeconds = 5;

    /** When true, requests on non-public paths without a JWT are rejected with 401. */
    private boolean enabled = true;

    public List<String> getPublicPaths() { return publicPaths; }
    public void setPublicPaths(List<String> publicPaths) { this.publicPaths = publicPaths; }

    public List<String> getSecretPaths() { return secretPaths; }
    public void setSecretPaths(List<String> secretPaths) { this.secretPaths = secretPaths; }

    public String getServiceSecret() { return serviceSecret; }
    public void setServiceSecret(String serviceSecret) { this.serviceSecret = serviceSecret; }

    public long getClockSkewSeconds() { return clockSkewSeconds; }
    public void setClockSkewSeconds(long clockSkewSeconds) { this.clockSkewSeconds = clockSkewSeconds; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}
