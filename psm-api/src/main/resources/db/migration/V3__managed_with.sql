-- V3: Add managed_with to action table.
-- A managed action inherits guards and permissions from its manager action.
-- Only one level allowed (no chaining).

ALTER TABLE action ADD COLUMN managed_with VARCHAR(100) REFERENCES action(id);

-- CANCEL inherits guards and permissions from CHECKIN
UPDATE action SET managed_with = 'act-checkin' WHERE id = 'act-cancel';

-- Remove CANCEL's own guard (now inherited from CHECKIN)
DELETE FROM action_guard WHERE action_id = 'act-cancel';
