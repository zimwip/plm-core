package com.plm.platform.auth;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.AntPathMatcher;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Shared servlet filter. For every inbound request:
 * <ul>
 *   <li>Strips the servlet context-path (e.g. {@code /api/pno}) so patterns are
 *       written relative to the service's own namespace.</li>
 *   <li>Bypasses {@code publicPaths} entirely.</li>
 *   <li>Validates {@code X-Service-Secret} on {@code secretPaths} (service-to-service).</li>
 *   <li>Otherwise requires a {@code Bearer} JWT, verifies it, and runs every
 *       registered {@link PlmAuthContextBinder}.</li>
 * </ul>
 *
 * Replaces the per-service JwtAuthFilter / PlmAdminAuthFilter / SettingsAuthFilter /
 * PnoAuthFilter copies that used to live in each app.
 */
public class PlmAuthFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(PlmAuthFilter.class);
    private static final AntPathMatcher MATCHER = new AntPathMatcher();

    private final AuthProperties props;
    private final JwtVerifier verifier;
    private final List<PlmAuthContextBinder> binders;

    public PlmAuthFilter(AuthProperties props, JwtVerifier verifier, List<PlmAuthContextBinder> binders) {
        this.props = props;
        this.verifier = verifier;
        this.binders = binders;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        String uri = req.getRequestURI();
        String ctxPath = req.getContextPath();
        String pathInCtx = (ctxPath != null && !ctxPath.isEmpty() && uri.startsWith(ctxPath))
            ? uri.substring(ctxPath.length()) : uri;

        if (matchesAny(pathInCtx, props.getPublicPaths())) {
            chain.doFilter(request, response);
            return;
        }

        if (matchesAny(pathInCtx, props.getSecretPaths())) {
            String provided = req.getHeader("X-Service-Secret");
            if (provided == null || !provided.equals(props.getServiceSecret())) {
                reject(resp, 403, "Invalid or missing service secret");
                return;
            }
            chain.doFilter(request, response);
            return;
        }

        String auth = req.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            reject(resp, 401, "Missing Bearer token");
            return;
        }
        Optional<PlmPrincipal> principal = verifier.verify(auth.substring("Bearer ".length()).trim());
        if (principal.isEmpty()) {
            reject(resp, 401, "Invalid or expired token");
            return;
        }

        try {
            req.setAttribute("plm.principal", principal.get());
            for (PlmAuthContextBinder b : binders) {
                b.bind(principal.get(), req);
            }
            log.debug("Auth: {}", principal.get());
            chain.doFilter(request, response);
        } finally {
            for (PlmAuthContextBinder b : binders) {
                b.clear();
            }
        }
    }

    private static boolean matchesAny(String path, List<String> patterns) {
        if (patterns == null) return false;
        for (String p : patterns) {
            if (MATCHER.match(p, path) || path.startsWith(p)) return true;
        }
        return false;
    }

    private static void reject(HttpServletResponse resp, int status, String message) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json");
        resp.getWriter().write("{\"error\":\"" + message.replace("\"", "\\\"") + "\"}");
    }
}
