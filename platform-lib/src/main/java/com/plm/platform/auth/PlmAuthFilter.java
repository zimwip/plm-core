package com.plm.platform.auth;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.AntPathMatcher;

import com.plm.platform.client.OperationTokenContext;
import com.plm.platform.client.ServiceClientTokenContext;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Shared servlet filter applied to every inbound request:
 * <ul>
 *   <li>Bypasses {@code publicPaths} entirely.</li>
 *   <li>Validates {@code X-Service-Secret} on {@code secretPaths} (S2S calls).</li>
 *   <li>Otherwise requires a {@code Bearer} forward JWT minted by spe-api,
 *       trusts the roleIds/perms claims carried by the token (no per-request pno
 *       lookup), then calls every registered {@link PlmAuthContextBinder} to
 *       populate service-local ThreadLocals.</li>
 * </ul>
 */
public class PlmAuthFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(PlmAuthFilter.class);
    private static final AntPathMatcher MATCHER = new AntPathMatcher();

    private final AuthProperties props;
    private final JwtVerifier verifier;
    private final List<PlmAuthContextBinder> binders;

    public PlmAuthFilter(AuthProperties props, JwtVerifier verifier,
                         List<PlmAuthContextBinder> binders) {
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
            // Capture JWT + job-id from caller so async threads can propagate them
            // on subsequent S2S calls (e.g., long-running import jobs calling back to psm).
            String authHeader = req.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                ServiceClientTokenContext.set(authHeader.substring("Bearer ".length()).trim());
                String ps = req.getHeader("X-PLM-ProjectSpace");
                if (ps != null) ServiceClientTokenContext.setProjectSpace(ps);
            }
            String jobId = req.getHeader("X-Job-Id");
            if (jobId != null) OperationTokenContext.set(jobId);
            try {
                chain.doFilter(request, response);
            } finally {
                ServiceClientTokenContext.clear();
                OperationTokenContext.clear();
            }
            return;
        }

        String auth = req.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            reject(resp, 401, "Missing Bearer token");
            return;
        }
        String token = auth.substring("Bearer ".length()).trim();
        Optional<PlmPrincipal> base = verifier.verify(token);
        if (base.isEmpty()) {
            reject(resp, 401, "Invalid or expired token");
            return;
        }

        PlmPrincipal p = base.get();

        // Operation tokens (typ=op) must carry X-Job-Id matching the jid claim.
        if ("op".equals(p.tokenType())) {
            String jobIdHeader = req.getHeader("X-Job-Id");
            if (jobIdHeader == null || !jobIdHeader.equals(p.jobId())) {
                reject(resp, 403, "Operation token job-id mismatch");
                return;
            }
        }

        // Trust the token: roleIds + perms are carried as claims by spe-api. No
        // per-request pno lookup. `p` already holds them straight from the JWT.
        PlmPrincipal principal = p;

        try {
            req.setAttribute("plm.principal", principal);
            for (PlmAuthContextBinder b : binders) b.bind(principal, req);
            ServiceClientTokenContext.set(token);
            ServiceClientTokenContext.setProjectSpace(principal.projectSpaceId());
            if (principal.jobId() != null) OperationTokenContext.set(principal.jobId());
            log.debug("Auth: {}", principal);
            chain.doFilter(request, response);
        } finally {
            for (PlmAuthContextBinder b : binders) b.clear();
            ServiceClientTokenContext.clear();
            OperationTokenContext.clear();
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
