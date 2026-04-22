-- Project space service tag configuration.
-- Each row maps a project space to a service tag: "for service X, use instances tagged Y".
-- A project space can have multiple tags for the same service.
-- No entry for a service = no tag preference (route to untagged instances).

CREATE TABLE project_space_service_tag (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    project_space_id VARCHAR(36)  NOT NULL,
    service_code     VARCHAR(100) NOT NULL,
    tag_value        VARCHAR(100) NOT NULL,
    CONSTRAINT psst_project_space_fkey FOREIGN KEY (project_space_id) REFERENCES project_space(id),
    CONSTRAINT psst_unique UNIQUE (project_space_id, service_code, tag_value)
);

CREATE INDEX idx_psst_project_space ON project_space_service_tag(project_space_id);

-- Isolated flag: when true, tags assigned to this project are exclusive
-- (no other project may use the same service+tag combination),
-- and untagged instances never serve this project.
ALTER TABLE project_space ADD COLUMN isolated SMALLINT DEFAULT 0;
