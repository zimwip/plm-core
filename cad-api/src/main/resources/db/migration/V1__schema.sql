CREATE TABLE IF NOT EXISTS cad_import_job (
    id               UUID         NOT NULL,
    status           VARCHAR(20)  NOT NULL,
    import_context   VARCHAR(100) NOT NULL DEFAULT 'default',
    filename         VARCHAR(500),
    file_count       INT          NOT NULL DEFAULT 1,
    psm_tx_id        UUID,
    root_node_id     UUID,
    project_space_id VARCHAR(100),
    created_by       VARCHAR(100),
    created_at       TIMESTAMP    NOT NULL,
    started_at       TIMESTAMP,
    completed_at     TIMESTAMP,
    error_summary    TEXT,
    CONSTRAINT pk_cad_import_job PRIMARY KEY (id),
    CONSTRAINT chk_job_status CHECK (status IN ('PENDING','RUNNING','DONE','FAILED'))
);

CREATE TABLE IF NOT EXISTS cad_import_job_result (
    id            UUID         NOT NULL,
    job_id        UUID         NOT NULL,
    cad_node_id   VARCHAR(500),
    cad_node_name VARCHAR(500),
    cad_node_type VARCHAR(50),
    action        VARCHAR(20),
    psm_node_id   UUID,
    error_message TEXT,
    CONSTRAINT pk_cad_import_job_result PRIMARY KEY (id),
    CONSTRAINT fk_job_result_job FOREIGN KEY (job_id)
        REFERENCES cad_import_job(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_import_job_result_job ON cad_import_job_result(job_id);
CREATE INDEX IF NOT EXISTS idx_import_job_created_by ON cad_import_job(created_by);
CREATE INDEX IF NOT EXISTS idx_import_job_status ON cad_import_job(status);
