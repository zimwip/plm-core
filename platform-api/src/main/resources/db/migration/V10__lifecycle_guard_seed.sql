-- ============================================================
-- Seed lifecycle guard algorithms and transition guard config.
-- IDs match ActionCatalogRegistryController contribution pattern
-- (alg-<svc>-c-<code>, ainst-<svc>-c-<safe-code>) so that
-- auto-registration ON CONFLICT clauses are no-ops.
-- lifecycle_transition_guard FK was dropped in V4.
-- ============================================================

-- Clean up stale rows from previous auto-registration attempts that used
-- the old "lg" prefix (alg-psm-lg-*, ainst-psm-lg-*) or "sys-lc-guard-psm"
-- algorithm_type. These conflict with the canonical IDs inserted below.
DELETE FROM algorithm_instance_param_value
    WHERE algorithm_instance_id IN (
        'ainst-psm-lg-all-required-filled',
        'ainst-psm-lg-all-signatures-done',
        'ainst-psm-lg-signature-rejection-check'
    );
DELETE FROM algorithm_instance
    WHERE id IN (
        'ainst-psm-lg-all-required-filled',
        'ainst-psm-lg-all-signatures-done',
        'ainst-psm-lg-signature-rejection-check'
    );
DELETE FROM algorithm
    WHERE id IN (
        'alg-psm-lg-all-required-filled',
        'alg-psm-lg-all-signatures-done',
        'alg-psm-lg-signature-rejection-check'
    );
DELETE FROM algorithm_type WHERE id = 'sys-lc-guard-psm';

-- Algorithm type
INSERT INTO algorithm_type (id, service_code, name, java_interface)
VALUES ('algtype-lifecycle-guard', 'psm', 'Lifecycle Guard', 'LifecycleGuard')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Algorithms (ids match ActionCatalogRegistryController contribution pattern)
INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name)
VALUES
    ('alg-psm-c-all-required-filled',       'psm', 'algtype-lifecycle-guard', 'all_required_filled',       'All Required Filled',       'all_required_filled',       'node'),
    ('alg-psm-c-all-signatures-done',       'psm', 'algtype-lifecycle-guard', 'all_signatures_done',       'All Signatures Done',        'all_signatures_done',       'node'),
    ('alg-psm-c-signature-rejection-check', 'psm', 'algtype-lifecycle-guard', 'signature_rejection_check', 'Signature Rejection Check',  'signature_rejection_check', 'node')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name;

-- Algorithm parameter for signature rejection mode
INSERT INTO algorithm_parameter (id, algorithm_id, param_name, param_label, data_type, required, display_order)
VALUES ('ap-psm-sig-rejection-mode', 'alg-psm-c-signature-rejection-check', 'mode', 'Rejection Check Mode', 'STRING', 1, 1)
ON CONFLICT (id) DO NOTHING;

-- Algorithm instances
INSERT INTO algorithm_instance (id, service_code, algorithm_id, name)
VALUES
    ('ainst-psm-c-all-required-filled',       'psm', 'alg-psm-c-all-required-filled',       'All Required Filled'),
    ('ainst-psm-c-all-signatures-done',       'psm', 'alg-psm-c-all-signatures-done',        'All Signatures Done'),
    ('ainst-psm-c-sig-no-rejected',           'psm', 'alg-psm-c-signature-rejection-check',  'No Rejected Signatures'),
    ('ainst-psm-c-sig-has-rejected',          'psm', 'alg-psm-c-signature-rejection-check',  'Has Rejected Signature')
ON CONFLICT (id) DO NOTHING;

-- Param values for signature rejection instances
INSERT INTO algorithm_instance_param_value (id, algorithm_instance_id, algorithm_parameter_id, value)
VALUES
    ('aipv-psm-sig-no-rejected',  'ainst-psm-c-sig-no-rejected',  'ap-psm-sig-rejection-mode', 'NO_REJECTED'),
    ('aipv-psm-sig-has-rejected', 'ainst-psm-c-sig-has-rejected', 'ap-psm-sig-rejection-mode', 'HAS_REJECTED')
ON CONFLICT (algorithm_instance_id, algorithm_parameter_id) DO UPDATE SET value = EXCLUDED.value;

-- Lifecycle transition guards (FK dropped in V4, instances above ensure referential correctness)
INSERT INTO lifecycle_transition_guard (id, service_code, lifecycle_transition_id, algorithm_instance_id, effect, display_order)
VALUES
    ('ltg-release-sig',           'psm', 'tr-release',  'ainst-psm-c-all-signatures-done',  'BLOCK', 1),
    ('ltg-release-no-rejected',   'psm', 'tr-release',  'ainst-psm-c-sig-no-rejected',      'BLOCK', 2),
    ('ltg-freeze-required',       'psm', 'tr-freeze',   'ainst-psm-c-all-required-filled',   'BLOCK', 1),
    ('ltg-unfreeze-has-rejected', 'psm', 'tr-unfreeze', 'ainst-psm-c-sig-has-rejected',      'BLOCK', 1)
ON CONFLICT (service_code, lifecycle_transition_id, algorithm_instance_id) DO NOTHING;
