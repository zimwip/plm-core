package com.pno.infrastructure.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
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
@RequiredArgsConstructor
public class PnoAuthFilter implements Filter {

    private final DSLContext dsl;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest  req  = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        String uri = req.getRequestURI();

        // Bypass auth for actuator and for the service-to-service context endpoint
        // (called by plm-api before its own user context is established)
        if (uri.startsWith("/actuator")
                || uri.startsWith("/v3/api-docs")
                || uri.startsWith("/swagger-ui")
                || uri.matches("/api/pno/users/[^/]+/context")) {
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
                resp.getWriter().write("{\"error\":\"Unknown user: " + userId + "\"}");
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

        String      username = user.get("username", String.class);
        boolean     isAdmin  = false;
        Set<String> roleIds  = new HashSet<>();

        var roles = dsl.select(
                DSL.field("r.id").as("role_id"),
                DSL.field("r.is_admin").as("is_admin"))
            .from("user_role ur")
            .join("pno_role r").on("ur.role_id = r.id")
            .where("ur.user_id = ?", userId)
            .fetch();

        for (var role : roles) {
            roleIds.add(role.get("role_id", String.class));
            if (Integer.valueOf(1).equals(role.get("is_admin", Integer.class))) {
                isAdmin = true;
            }
        }

        return new PnoUserContext(userId, username, roleIds, isAdmin);
    }
}
