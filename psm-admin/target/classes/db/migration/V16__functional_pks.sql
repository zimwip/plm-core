-- ============================================================
-- V16: Functional PKs — replace UUID primary keys with natural
-- composite keys on junction/attachment tables, and make
-- psa_import_context.code the primary key.
--
-- Main entity tables (lifecycle, node_type, attribute_definition,
-- domain, link_type, enum_definition) keep their 'id' column.
-- Java services now enforce functional kebab-case codes for all
-- new items instead of UUID.randomUUID().
--
-- Any existing rows with UUID-valued 'id' must be re-created by
-- the administrator with functional codes before using the API.
-- ============================================================

-- ================================================================
-- lifecycle_transition_guard
-- PK: (lifecycle_transition_id, algorithm_instance_id)
-- ================================================================
ALTER TABLE lifecycle_transition_guard DROP CONSTRAINT IF EXISTS lifecycle_transition_guard_pkey;
ALTER TABLE lifecycle_transition_guard DROP CONSTRAINT IF EXISTS uq_ltg;
ALTER TABLE lifecycle_transition_guard ADD PRIMARY KEY (lifecycle_transition_id, algorithm_instance_id);
ALTER TABLE lifecycle_transition_guard DROP COLUMN id;

-- ================================================================
-- lifecycle_state_action
-- PK: (lifecycle_state_id, algorithm_instance_id, trigger)
-- ================================================================
ALTER TABLE lifecycle_state_action DROP CONSTRAINT IF EXISTS lifecycle_state_action_pkey;
ALTER TABLE lifecycle_state_action DROP CONSTRAINT IF EXISTS uq_lsa;
ALTER TABLE lifecycle_state_action ADD PRIMARY KEY (lifecycle_state_id, algorithm_instance_id, trigger);
ALTER TABLE lifecycle_state_action DROP COLUMN id;

-- ================================================================
-- signature_requirement
-- PK: (lifecycle_transition_id, role_required)
-- ================================================================
ALTER TABLE signature_requirement DROP CONSTRAINT IF EXISTS signature_requirement_pkey;
ALTER TABLE signature_requirement ADD PRIMARY KEY (lifecycle_transition_id, role_required);
ALTER TABLE signature_requirement DROP COLUMN id;

-- ================================================================
-- enum_value
-- PK: (enum_definition_id, value)
-- ================================================================
ALTER TABLE enum_value DROP CONSTRAINT IF EXISTS enum_value_pkey;
ALTER TABLE enum_value DROP CONSTRAINT IF EXISTS enum_value_unique;
ALTER TABLE enum_value ADD PRIMARY KEY (enum_definition_id, value);
ALTER TABLE enum_value DROP COLUMN id;

-- ================================================================
-- link_type_cascade
-- PK: (link_type_id, parent_transition_id, child_from_state_id)
-- The existing unnamed UNIQUE on these columns stays as a redundant
-- constraint alongside the new PK (harmless on both H2 and PG).
-- ================================================================
ALTER TABLE link_type_cascade DROP CONSTRAINT IF EXISTS link_type_cascade_pkey;
ALTER TABLE link_type_cascade ADD PRIMARY KEY (link_type_id, parent_transition_id, child_from_state_id);
ALTER TABLE link_type_cascade DROP COLUMN id;

-- ================================================================
-- link_type_attribute
-- PK: (link_type_id, name)  — name is the functional field key
-- ================================================================
ALTER TABLE link_type_attribute DROP CONSTRAINT IF EXISTS link_type_attribute_pkey;
ALTER TABLE link_type_attribute ADD PRIMARY KEY (link_type_id, name);
ALTER TABLE link_type_attribute DROP COLUMN id;

-- ================================================================
-- view_attribute_override
-- PK: (view_id, attribute_def_id)
-- ================================================================
ALTER TABLE view_attribute_override DROP CONSTRAINT IF EXISTS view_attribute_override_pkey;
ALTER TABLE view_attribute_override DROP CONSTRAINT IF EXISTS uq_view_attr;
ALTER TABLE view_attribute_override ADD PRIMARY KEY (view_id, attribute_def_id);
ALTER TABLE view_attribute_override DROP COLUMN id;

-- ================================================================
-- psa_import_context
-- PK: code (the business code, already UNIQUE NOT NULL)
-- ================================================================
ALTER TABLE psa_import_context DROP CONSTRAINT IF EXISTS psa_import_context_pkey;
ALTER TABLE psa_import_context ADD PRIMARY KEY (code);
ALTER TABLE psa_import_context DROP COLUMN id;

-- ================================================================
-- Uniqueness guards for main entity scoped names
-- Prevents duplicate attribute names per node_type or domain,
-- and duplicate state/transition names per lifecycle.
-- ================================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_attr_def_nodetype_name
    ON attribute_definition (node_type_id, name) WHERE node_type_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_attr_def_domain_name
    ON attribute_definition (domain_id, name) WHERE domain_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_lifecycle_state_name
    ON lifecycle_state (lifecycle_id, name);

CREATE UNIQUE INDEX IF NOT EXISTS uq_lifecycle_transition_name
    ON lifecycle_transition (lifecycle_id, name);
