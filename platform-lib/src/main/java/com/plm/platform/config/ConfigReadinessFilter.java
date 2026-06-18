package com.plm.platform.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Short-circuits config-dependent requests while the {@link ConfigCache} is not
 * yet populated. A consumer (psm-data) now starts UP-but-UNCONFIGURED — its
 * single best-effort pull may fail until psm-admin (psa) is ready — so user
 * requests that rely on the metamodel must not silently behave as "empty config"
 * (which surfaced as missing actions/guards). They get a clear 503 instead and
 * succeed once the first snapshot lands (pulled on psa's CONFIG_CHANGED).
 *
 * <p>Only wired for config consumers (see {@code ConfigRegistrationAutoConfiguration},
 * gated on {@code psm.config.admin-url}). Health, S2S, docs and plugin-bundle
 * paths stay open so the service can become healthy and bootstrap.
 */
@Slf4j
public class ConfigReadinessFilter extends OncePerRequestFilter {

    private final ConfigCache configCache;

    /** Bare (root context) prefixes that must work before config loads. */
    private static final String[] EXEMPT = {
        "/actuator", "/internal", "/v3/api-docs", "/swagger-ui", "/error", "/ui/"
    };

    public ConfigReadinessFilter(ConfigCache configCache) {
        this.configCache = configCache;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        if (configCache.isPopulated() || isExempt(req.getRequestURI())) {
            chain.doFilter(req, res);
            return;
        }
        res.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
        res.setContentType("application/json");
        res.getWriter().write(
            "{\"error\":\"SERVICE_NOT_CONFIGURED\","
          + "\"message\":\"Configuration not yet loaded from psm-admin — retry shortly.\"}");
    }

    private boolean isExempt(String uri) {
        if (uri == null) return true;
        for (String p : EXEMPT) {
            if (uri.startsWith(p)) return true;
        }
        return false;
    }
}
