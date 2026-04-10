-- ============================================================
-- PLM SCHEMA - V2 : Signatures électroniques
-- ============================================================

-- Signatures apposées sur des versions de noeuds
CREATE TABLE node_signature (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_id         VARCHAR(36)  NOT NULL REFERENCES node(id),
    node_version_id VARCHAR(36)  NOT NULL REFERENCES node_version(id),
    signed_by       VARCHAR(100) NOT NULL,
    signed_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    meaning         VARCHAR(100) NOT NULL,  -- ex: Approved, Reviewed, Verified
    comment         VARCHAR(1000)
);

-- Signataires requis pour autoriser une transition (guard all_signatures_done)
CREATE TABLE signature_requirement (
    id                       VARCHAR(36)  NOT NULL PRIMARY KEY,
    lifecycle_transition_id  VARCHAR(36)  NOT NULL REFERENCES lifecycle_transition(id),
    role_required            VARCHAR(100) NOT NULL,  -- rôle utilisateur requis
    display_order            INT          NOT NULL DEFAULT 0
);

CREATE INDEX idx_signature_node    ON node_signature(node_id);
CREATE INDEX idx_signature_version ON node_signature(node_version_id);
CREATE INDEX idx_sigreq_transition ON signature_requirement(lifecycle_transition_id);
