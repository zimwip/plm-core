package com.plm.platform.client;

import com.plm.platform.environment.PlatformRegistrationProperties;
import com.plm.platform.action.dto.ServiceInstanceInfo;
import com.plm.platform.registry.LocalServiceRegistry;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.retry.Retry;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * Registry-aware HTTP client for direct service-to-service calls.
 * Resolves target URLs from {@link LocalServiceRegistry}, applies
 * Resilience4j circuit breaker + retry, and auto-injects X-Service-Secret.
 *
 * <p>Usage:
 * <pre>
 * // Simple GET
 * List&lt;String&gt; ids = serviceClient.get("pno-api",
 *     "/api/pno/project-spaces/{id}/descendants",
 *     new ParameterizedTypeReference&lt;List&lt;String&gt;&gt;() {}, psId);
 *
 * // POST with body
 * Result r = serviceClient.post("psm-api", "/api/psm/nodes", body, Result.class);
 * </pre>
 */
@Slf4j
public class ServiceClient {

    private static final long REGISTRY_WAIT_SECONDS = 15;

    private final LocalServiceRegistry registry;
    private final ServiceClientResilience resilience;
    private final PlatformRegistrationProperties props;
    private final RestTemplate restTemplate;

    public ServiceClient(LocalServiceRegistry registry,
                         ServiceClientResilience resilience,
                         PlatformRegistrationProperties props,
                         RestTemplate restTemplate) {
        this.registry = registry;
        this.resilience = resilience;
        this.props = props;
        this.restTemplate = restTemplate;
    }

    /**
     * GET with a simple response type.
     */
    public <T> T get(String serviceCode, String path, Class<T> responseType, Object... uriVars) {
        return exchange(serviceCode, path, HttpMethod.GET, null, responseType, uriVars);
    }

    /**
     * GET with a parameterized response type (generics like List&lt;String&gt;).
     */
    public <T> T get(String serviceCode, String path, ParameterizedTypeReference<T> responseType, Object... uriVars) {
        return exchangeParameterized(serviceCode, path, HttpMethod.GET, null, responseType, uriVars);
    }

    /**
     * POST with body and simple response type.
     */
    public <T> T post(String serviceCode, String path, Object body, Class<T> responseType) {
        return exchange(serviceCode, path, HttpMethod.POST, body, responseType);
    }

    /**
     * POST with body and parameterized response type.
     */
    public <T> T post(String serviceCode, String path, Object body, ParameterizedTypeReference<T> responseType) {
        return exchangeParameterized(serviceCode, path, HttpMethod.POST, body, responseType);
    }

    /**
     * Full exchange with simple response type.
     */
    public <T> T exchange(String serviceCode, String path, HttpMethod method,
                          Object body, Class<T> responseType, Object... uriVars) {
        ensureRegistryPopulated();
        CircuitBreaker cb = resilience.breakerFor(serviceCode);
        Retry retry = resilience.retryFor(serviceCode);

        Supplier<T> call = () -> {
            ServiceInstanceInfo instance = pickOrThrow(serviceCode);
            String url = instance.baseUrl() + path;
            HttpEntity<?> entity = buildEntity(body);
            ResponseEntity<T> resp = restTemplate.exchange(url, method, entity, responseType, uriVars);
            return resp.getBody();
        };

        return Retry.decorateSupplier(retry, CircuitBreaker.decorateSupplier(cb, call)).get();
    }

    /**
     * Full exchange with extra headers (e.g. X-PLM-Tx for background/async S2S calls).
     */
    public <T> T exchange(String serviceCode, String path, HttpMethod method,
                          Object body, Class<T> responseType, Map<String, String> extraHeaders) {
        ensureRegistryPopulated();
        CircuitBreaker cb = resilience.breakerFor(serviceCode);
        Retry retry = resilience.retryFor(serviceCode);

        Supplier<T> call = () -> {
            ServiceInstanceInfo instance = pickOrThrow(serviceCode);
            String url = instance.baseUrl() + path;
            HttpEntity<?> entity = buildEntity(body, extraHeaders);
            ResponseEntity<T> resp = restTemplate.exchange(url, method, entity, responseType);
            return resp.getBody();
        };

        return Retry.decorateSupplier(retry, CircuitBreaker.decorateSupplier(cb, call)).get();
    }

    /**
     * Full exchange with parameterized response type.
     */
    public <T> T exchangeParameterized(String serviceCode, String path, HttpMethod method,
                                       Object body, ParameterizedTypeReference<T> responseType,
                                       Object... uriVars) {
        ensureRegistryPopulated();
        CircuitBreaker cb = resilience.breakerFor(serviceCode);
        Retry retry = resilience.retryFor(serviceCode);

        Supplier<T> call = () -> {
            ServiceInstanceInfo instance = pickOrThrow(serviceCode);
            String url = instance.baseUrl() + path;
            HttpEntity<?> entity = buildEntity(body);
            ResponseEntity<T> resp = restTemplate.exchange(url, method, entity, responseType, uriVars);
            return resp.getBody();
        };

        return Retry.decorateSupplier(retry, CircuitBreaker.decorateSupplier(cb, call)).get();
    }

    /**
     * Resolve a base URL for the given service (for edge cases needing raw URL).
     */
    public String resolveBaseUrl(String serviceCode) {
        ensureRegistryPopulated();
        return pickOrThrow(serviceCode).baseUrl();
    }

    private ServiceInstanceInfo pickOrThrow(String serviceCode) {
        return registry.pickInstance(serviceCode)
            .orElseThrow(() -> new ServiceUnavailableException(serviceCode));
    }

    /**
     * Upload raw bytes as multipart/form-data to the named service.
     * Returns the {@code id} field from the JSON response body.
     */
    public String uploadMultipart(String serviceCode, String path,
                                  byte[] bytes, String filename, String fileContentType) {
        ensureRegistryPopulated();
        CircuitBreaker cb = resilience.breakerFor(serviceCode);
        Retry retry = resilience.retryFor(serviceCode);

        Supplier<String> call = () -> {
            ServiceInstanceInfo instance = pickOrThrow(serviceCode);
            String url = instance.baseUrl() + path;

            HttpHeaders authHeaders = buildAuthHeaders();
            org.springframework.util.LinkedMultiValueMap<String, Object> parts =
                new org.springframework.util.LinkedMultiValueMap<>();
            org.springframework.core.io.ByteArrayResource resource =
                new org.springframework.core.io.ByteArrayResource(bytes) {
                    @Override public String getFilename() { return filename; }
                };
            HttpHeaders partHeaders = new HttpHeaders();
            if (fileContentType != null) partHeaders.setContentType(MediaType.parseMediaType(fileContentType));
            parts.add("file", new HttpEntity<>(resource, partHeaders));
            if (filename != null) parts.add("name", filename);

            @SuppressWarnings("unchecked")
            Map<String, Object> body = restTemplate.exchange(
                url, HttpMethod.POST,
                new HttpEntity<>(parts, authHeaders),
                Map.class).getBody();
            if (body == null || !body.containsKey("id")) {
                throw new IllegalStateException("Multipart upload to " + path + " returned no id");
            }
            return body.get("id").toString();
        };

        return Retry.decorateSupplier(retry, CircuitBreaker.decorateSupplier(cb, call)).get();
    }

    private HttpEntity<?> buildEntity(Object body, Map<String, String> extraHeaders) {
        HttpEntity<?> base = buildEntity(body);
        if (extraHeaders == null || extraHeaders.isEmpty()) return base;
        HttpHeaders headers = new HttpHeaders();
        headers.addAll(base.getHeaders());
        extraHeaders.forEach(headers::set);
        return body != null ? new HttpEntity<>(body, headers) : new HttpEntity<>(headers);
    }

    private HttpEntity<?> buildEntity(Object body) {
        HttpHeaders headers = buildAuthHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return body != null ? new HttpEntity<>(body, headers) : new HttpEntity<>(headers);
    }

    /** Builds auth+tracing headers without setting Content-Type (caller controls it). */
    private HttpHeaders buildAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Service-Secret", props.serviceSecret());

        // Delegated-user mode: async job forwards user identity via explicit headers
        // instead of a short-lived JWT. PlmAuthFilter on the target service validates
        // X-Service-Secret and reconstructs the security context from these headers.
        ServiceClientTokenContext.DelegatedContext delegated = ServiceClientTokenContext.getDelegated();
        if (delegated != null) {
            headers.set("X-PLM-User-Id", delegated.userId());
            headers.set("X-PLM-Is-Admin", String.valueOf(delegated.isAdmin()));
            if (delegated.roleIds() != null && !delegated.roleIds().isEmpty()) {
                headers.set("X-PLM-User-Roles", String.join(",", delegated.roleIds()));
            }
            if (delegated.projectSpaceId() != null && !delegated.projectSpaceId().isBlank()) {
                headers.set("X-PLM-ProjectSpace", delegated.projectSpaceId());
            }
            return headers;
        }

        String auth = null;
        try {
            ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest req = attrs.getRequest();
                auth = req.getHeader("Authorization");
                if (auth != null) headers.set("Authorization", auth);
                String ps = req.getHeader("X-PLM-ProjectSpace");
                if (ps != null) headers.set("X-PLM-ProjectSpace", ps);
                // OTel trace propagation — Micrometer interceptor overrides with child-span
                // traceparent when active; this is a fallback for unconfigured environments.
                String traceparent = req.getHeader("traceparent");
                if (traceparent != null) headers.set("traceparent", traceparent);
                String tracestate = req.getHeader("tracestate");
                if (tracestate != null) headers.set("tracestate", tracestate);
            }
        } catch (Exception ignored) {}
        // Fallback for async contexts where the request may have been recycled
        if (auth == null) {
            String override = ServiceClientTokenContext.get();
            if (override != null) headers.set("Authorization", override);
        }
        return headers;
    }

    private void ensureRegistryPopulated() {
        if (registry.isPopulated()) return;
        try {
            log.info("Waiting for local registry to be populated...");
            if (!registry.awaitPopulated(REGISTRY_WAIT_SECONDS, TimeUnit.SECONDS)) {
                throw new ServiceUnavailableException("(registry not yet populated)");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ServiceUnavailableException("(interrupted waiting for registry)");
        }
    }
}
