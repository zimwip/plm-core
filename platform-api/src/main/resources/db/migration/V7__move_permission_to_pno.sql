-- Permission catalog moves to pno-api (single source of truth).
-- Drop FK on action_required_permission.permission_code so the column
-- becomes a soft reference (opaque VARCHAR, validated at runtime via pno-api).

ALTER TABLE action_required_permission DROP CONSTRAINT IF EXISTS action_required_permission_permission_code_fkey;

-- Drop the permission table that was duplicated here from psm-admin.
DROP TABLE IF EXISTS permission;
