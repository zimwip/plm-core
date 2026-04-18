package com.pno.infrastructure.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

/**
 * Filtre HTTP qui résout le contexte utilisateur à chaque requête pno-api.
 *
 * pno-api est la source de vérité : il résout les utilisateurs directement
 * depuis sa propre DB (pno schema), sans appel HTTP externe.
 *
 * Certains endpoints sont ouverts sans authentification :
 *   - /actuator/** (health checks)
 *   - /api/pno/users/{id}/context (endpoint appelé par plm-api, sans contexte utilisateur propre)
 */
@Slf4j
@Component
@Order(1)
public class PnoAuthFilter implements Filter {

    private final DSLContext dsl;
    private final String     serviceSecret;

    public PnoAuthFilter(
        DSLContext dsl,
        @Value("${plm.service.secret:dev-secret-change-in-prod}") String serviceSecret
    ) {
        this.dsl           = dsl;
        this.serviceSecret = serviceSecret;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest  req  = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        String uri = req.getRequestURI();

        // Bypass auth for actuator
        if (uri.startsWith("/actuator")
                || uri.startsWith("/v3/api-docs")
                || uri.startsWith("/swagger-ui")) {
            chain.doFilter(request, response);
            return;
        }

        // Service-to-service context endpoint: requires X-Service-Secret
        if (uri.matches("/api/pno/users/[^/]+/context")) {
            String secret = req.getHeader("X-Service-Secret");
            if (!serviceSecret.equals(secret)) {
                resp.setStatus(403);
                resp.getWriter().write("{\"error\":\"Forbidden\"}");
                return;
            }
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

            PnoUserContext ctx = resolveUser(userId);
            if (ctx == null) {
                resp.setStatus(401);
                resp.getWriter().write("{\"error\":\"Unauthorized\"}");
                return;
            }

            PnoSecurityContext.set(ctx);
            log.debug("Auth: {}", ctx);
            chain.doFilter(request, response);

        } finally {
            PnoSecurityContext.clear();
        }
    }

    /**
     * Résout l'utilisateur et ses rôles depuis la table pno_user.
     * Retourne null si l'utilisateur n'existe pas ou est inactif.
     */
    private PnoUserContext resolveUser(String userId) {
        var user = dsl.select()
            .from("pno_user")
            .where("id = ?", userId)
            .and("active = 1")
            .fetchOne();

        if (user == null) return null;

        String  username = user.get("username",  String.class);
        boolean isAdmin  = Integer.valueOf(1).equals(user.get("is_admin", Integer.class));

        Set<String> roleIds = new HashSet<>();
        dsl.select(DSL.field("role_id"))
            .from("user_role")
            .where("user_id = ?", userId)
            .fetch()
            .forEach(r -> roleIds.add(r.get("role_id", String.class)));

        return new PnoUserContext(userId, username, roleIds, isAdmin);
    }
}
