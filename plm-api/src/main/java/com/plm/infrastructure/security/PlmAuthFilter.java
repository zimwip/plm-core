package com.plm.infrastructure.security;

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
import java.util.List;
import java.util.Set;

/**
 * Filtre HTTP qui résout le contexte utilisateur à chaque requête.
 *
 * En mode DEV : lit le header X-PLM-User (userId) et charge les rôles depuis la DB.
 * En mode PROD : à remplacer par une validation JWT/OAuth2.
 *
 * Après résolution, le contexte est disponible via PlmSecurityContext.get()
 * dans tous les services pour la durée de la requête.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class PlmAuthFilter implements Filter {

    private final DSLContext dsl;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest  req  = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        // Bypass auth for actuator endpoints (health checks)
        if (req.getRequestURI().startsWith("/actuator")) {
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

            PlmUserContext ctx = resolveUser(userId);
            if (ctx == null) {
                resp.setStatus(401);
                resp.getWriter().write("{\"error\":\"Unknown user: " + userId + "\"}");
                return;
            }

            PlmSecurityContext.set(ctx);
            log.debug("Auth: {}", ctx);
            chain.doFilter(request, response);

        } finally {
            PlmSecurityContext.clear();
        }
    }

    /**
     * Résout l'utilisateur et ses rôles depuis la base.
     * Retourne null si l'utilisateur n'existe pas ou est inactif.
     */
    private PlmUserContext resolveUser(String userId) {
        var user = dsl.select()
            .from("plm_user")
            .where("id = ?", userId)
            .and("active = 1")
            .fetchOne();

        if (user == null) return null;

        String  username    = user.get("username", String.class);
        boolean isAdmin     = false;
        Set<String> roleIds = new HashSet<>();

        // Charger les rôles
        var roles = dsl.select(
                DSL.field("r.id").as("role_id"),
                DSL.field("r.is_admin").as("is_admin"))
            .from("user_role ur")
            .join("plm_role r").on("ur.role_id = r.id")
            .where("ur.user_id = ?", userId)
            .fetch();

        for (var role : roles) {
            roleIds.add(role.get("role_id", String.class));
            if (role.get("is_admin", Integer.class) == 1) {
                isAdmin = true;
            }
        }

        return new PlmUserContext(userId, username, roleIds, isAdmin);
    }
}
