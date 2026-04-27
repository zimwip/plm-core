-- ============================================================
-- V3 — Drop authorization_policy from psm-admin
-- ============================================================
--
-- Phase D4: grants moved to pno-api (single source of truth for role × permission grants).
-- psm-admin keeps the permission + action catalog, but no longer stores grants.
-- Enforcing services (psm-api) pull grants from /api/pno/internal/authorization/snapshot.
-- ============================================================

DROP TABLE IF EXISTS authorization_policy;
