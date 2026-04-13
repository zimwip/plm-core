package com.plm.infrastructure.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Filtre HTTP qui résout le contexte utilisateur à chaque requête.
 *
 * Résolution : appel HTTP vers pno-api (GET /api/pno/users/{userId}/context?projectSpaceId=...)
 * avec cache Caffeine (30 s TTL) pour éviter la latence par requête.
 *
 * Le project space (X-PLM-ProjectSpace header) est lu avant l'appel à pno-api
 * afin que les rôles retournés soient filtrés pour cet espace.
 *
 * En mode DEV : pno-api doit tourner sur http://localhost:8081.
 * En Docker  : l'env var PNO_API_URL pointe vers http://pno-api:8081.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class PlmAuthFilter implements Filter {

    private final PnoApiClient pnoApiClient;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest  req  = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        String uri = req.getRequestURI();
        if (uri.startsWith("/actuator") || uri.startsWith("/v3/api-docs")
                || uri.startsWith("/swagger-ui") || uri.startsWith("/ws")) {
            chain.doFilter(request, response);
            return;
        }

        try {
            String userId = req.getHeader("X-PLM-User");

            if (userId == null || userId.isBlank()) {
                resp.setStatus(401);
                resp.getWriter().write("{\"error\":\"Missing X-PLM-User header\"}");
                return;
            }

            String projectSpaceId = req.getHeader("X-PLM-ProjectSpace");

            PlmUserContext ctx = pnoApiClient.getUserContext(userId, projectSpaceId);
            if (ctx == null) {
                resp.setStatus(401);
                resp.getWriter().write("{\"error\":\"Unknown user: " + userId + "\"}");
                return;
            }

            PlmSecurityContext.set(ctx);

            if (projectSpaceId != null && !projectSpaceId.isBlank()) {
                PlmProjectSpaceContext.set(projectSpaceId);
            }

            log.debug("Auth: {} projectSpace: {}", ctx, projectSpaceId);
            chain.doFilter(request, response);

        } finally {
            PlmSecurityContext.clear();
            PlmProjectSpaceContext.clear();
        }
    }
}
