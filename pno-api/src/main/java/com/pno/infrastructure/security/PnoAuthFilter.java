package com.pno.infrastructure.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Service-to-service bypass for the user-context endpoint.
 * spe-api calls /api/pno/users/{id}/context with X-Service-Secret to resolve
 * user identity before minting the JWT. This filter allows that call without
 * requiring a JWT (chicken-and-egg).
 *
 * All other paths fall through to JwtAuthFilter (@Order 0).
 */
@Slf4j
@Component
@Order(1)
public class PnoAuthFilter implements Filter {

    private final String serviceSecret;

    public PnoAuthFilter(
        @Value("${plm.service.secret}") String serviceSecret
    ) {
        this.serviceSecret = serviceSecret;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest  req  = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        String uri = req.getRequestURI();

        if (uri.matches("/api/pno/users/[^/]+/context")) {
            String secret = req.getHeader("X-Service-Secret");
            if (!serviceSecret.equals(secret)) {
                resp.setStatus(403);
                resp.setContentType("application/json");
                resp.getWriter().write("{\"error\":\"Forbidden\"}");
                return;
            }
            chain.doFilter(request, response);
            return;
        }

        chain.doFilter(request, response);
    }
}
