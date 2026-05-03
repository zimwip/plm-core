-- V4 seeded wrapper instances (ainst-psm-wi-tx-*) but never seeded the
-- algorithm_parameter row for tx_mode nor the per-instance param values.
-- TransactionWrapper defaults to REQUIRED, so AUTO_OPEN / ISOLATED / NONE
-- instances all behaved as REQUIRED — any action that auto-creates a
-- transaction (create_node, checkout, create_link …) would fail with
-- "requires an open transaction".

INSERT INTO platform.algorithm_parameter (id, algorithm_id, param_name, param_label, data_type, required, default_value, display_order)
VALUES ('ap-wrapper-tx-mode', 'alg-psm-wrapper-transaction', 'tx_mode', 'Transaction Mode', 'STRING', 1, 'REQUIRED', 1)
ON CONFLICT (algorithm_id, param_name) DO NOTHING;

INSERT INTO platform.algorithm_instance_param_value (id, algorithm_instance_id, algorithm_parameter_id, value)
VALUES
    ('aipv-tx-auto-open', 'ainst-psm-wi-tx-auto-open', 'ap-wrapper-tx-mode', 'AUTO_OPEN'),
    ('aipv-tx-isolated',  'ainst-psm-wi-tx-isolated',  'ap-wrapper-tx-mode', 'ISOLATED'),
    ('aipv-tx-required',  'ainst-psm-wi-tx-required',  'ap-wrapper-tx-mode', 'REQUIRED'),
    ('aipv-tx-none',      'ainst-psm-wi-tx-none',      'ap-wrapper-tx-mode', 'NONE')
ON CONFLICT (algorithm_instance_id, algorithm_parameter_id) DO UPDATE SET value = EXCLUDED.value;
