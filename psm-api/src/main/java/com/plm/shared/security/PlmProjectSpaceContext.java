package com.plm.shared.security;

/**
 * Holder ThreadLocal du contexte de ségrégation (project space) courant.
 * Initialisé par PlmAuthFilter à chaque requête HTTP depuis le header X-PLM-ProjectSpace.
 *
 * Le project space filtre toutes les opérations sur les noeuds :
 * un noeud n'est visible que si son project_space_id correspond au contexte actif.
 */
public final class PlmProjectSpaceContext {

    private static final ThreadLocal<String> CURRENT = new ThreadLocal<>();

    public static void set(String projectSpaceId) {
        CURRENT.set(projectSpaceId);
    }

    /** Retourne le project space ID courant, ou null si non défini. */
    public static String get() {
        return CURRENT.get();
    }

    /**
     * Retourne le project space ID courant.
     * Lève une exception si le contexte n'est pas initialisé (requête sans header X-PLM-ProjectSpace).
     */
    public static String require() {
        String id = CURRENT.get();
        if (id == null) {
            throw new IllegalStateException("No project space context — X-PLM-ProjectSpace header is required");
        }
        return id;
    }

    public static void clear() {
        CURRENT.remove();
    }

    private PlmProjectSpaceContext() {}
}
