-- ============================================================
-- Lowercase all action codes and handler algorithm codes
-- ============================================================

-- Algorithm codes (handlers only — wrappers/guards already lowercase)
UPDATE algorithm SET code = 'checkout'    WHERE code = 'CHECKOUT';
UPDATE algorithm SET code = 'checkin'     WHERE code = 'CHECKIN';
UPDATE algorithm SET code = 'update_node' WHERE code = 'UPDATE_NODE';
UPDATE algorithm SET code = 'transition'  WHERE code = 'TRANSITION';
UPDATE algorithm SET code = 'sign'        WHERE code = 'SIGN';
UPDATE algorithm SET code = 'create_link' WHERE code = 'CREATE_LINK';
UPDATE algorithm SET code = 'update_link' WHERE code = 'UPDATE_LINK';
UPDATE algorithm SET code = 'delete_link' WHERE code = 'DELETE_LINK';
UPDATE algorithm SET code = 'baseline'    WHERE code = 'BASELINE';
UPDATE algorithm SET code = 'commit'      WHERE code = 'COMMIT';
UPDATE algorithm SET code = 'rollback'    WHERE code = 'ROLLBACK';
UPDATE algorithm SET code = 'abort'       WHERE code = 'ABORT';
UPDATE algorithm SET code = 'create_node' WHERE code = 'CREATE_NODE';

-- Action codes
UPDATE action SET action_code = 'read_node'        WHERE action_code = 'READ_NODE';
UPDATE action SET action_code = 'read'             WHERE action_code = 'READ';
UPDATE action SET action_code = 'manage_metamodel' WHERE action_code = 'MANAGE_METAMODEL';
UPDATE action SET action_code = 'manage_roles'     WHERE action_code = 'MANAGE_ROLES';
UPDATE action SET action_code = 'manage_baselines' WHERE action_code = 'MANAGE_BASELINES';
UPDATE action SET action_code = 'manage_lifecycle' WHERE action_code = 'MANAGE_LIFECYCLE';
UPDATE action SET action_code = 'checkout'         WHERE action_code = 'CHECKOUT';
UPDATE action SET action_code = 'checkin'          WHERE action_code = 'CHECKIN';
UPDATE action SET action_code = 'update_node'      WHERE action_code = 'UPDATE_NODE';
UPDATE action SET action_code = 'transition'       WHERE action_code = 'TRANSITION';
UPDATE action SET action_code = 'sign'             WHERE action_code = 'SIGN';
UPDATE action SET action_code = 'create_link'      WHERE action_code = 'CREATE_LINK';
UPDATE action SET action_code = 'update_link'      WHERE action_code = 'UPDATE_LINK';
UPDATE action SET action_code = 'delete_link'      WHERE action_code = 'DELETE_LINK';
UPDATE action SET action_code = 'baseline'         WHERE action_code = 'BASELINE';
UPDATE action SET action_code = 'commit'           WHERE action_code = 'COMMIT';
UPDATE action SET action_code = 'rollback'         WHERE action_code = 'ROLLBACK';
UPDATE action SET action_code = 'abort'            WHERE action_code = 'ABORT';
UPDATE action SET action_code = 'create_node'      WHERE action_code = 'CREATE_NODE';
