-- ============================================================
-- Military project space + service tag segregation
--
-- ps-default  → routed to psm-api-1 (tag PSM1, schema psm1)
-- ps-military → routed to psm-api-2 (tag PSM2, schema psm2)
--
-- Each PSM instance operates on its own PostgreSQL schema,
-- giving full data isolation between project spaces.
-- ============================================================

-- ── New project space ──────────────────────────────────────────

INSERT INTO project_space (id, name, description, isolated) VALUES
  ('ps-military', 'Military',
   'Military programs — isolated data storage on dedicated PSM instance.',
   1);

-- ── Service tag assignments ────────────────────────────────────
-- Map each project space to the PSM instance tag that serves it.
-- SPE gateway reads these tags to route requests to the correct instance.

INSERT INTO project_space_service_tag (id, project_space_id, service_code, tag_value) VALUES
  ('psst-default-psm', 'ps-default',  'psm-api', 'PSM1'),
  ('psst-military-psm','ps-military', 'psm-api', 'PSM2');

-- ── User role assignments for military space ───────────────────
-- Admin gets full access. Alice and Bob get their usual roles.

INSERT INTO user_role (id, user_id, role_id, project_space_id) VALUES
  ('ur-5', 'user-admin', 'role-admin',    'ps-military'),
  ('ur-6', 'user-alice', 'role-designer', 'ps-military'),
  ('ur-7', 'user-bob',   'role-reviewer', 'ps-military');
