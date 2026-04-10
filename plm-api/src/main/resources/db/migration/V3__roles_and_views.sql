-- ============================================================
-- PLM SCHEMA - V3 : Gestion des rôles et vues
-- ============================================================

-- ============================================================
-- ROLES & UTILISATEURS
-- ============================================================

-- Rôles applicatifs PLM
CREATE TABLE plm_role (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    is_admin    SMALLINT     NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_role_name UNIQUE (name)
);

-- Utilisateurs PLM (peut être synchronisé avec un IdP externe)
CREATE TABLE plm_user (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    username    VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    email       VARCHAR(255),
    active      SMALLINT     NOT NULL DEFAULT 1,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_username UNIQUE (username)
);

-- Assignation utilisateur ↔ rôle (N-N)
CREATE TABLE user_role (
    id      VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES plm_user(id),
    role_id VARCHAR(36) NOT NULL REFERENCES plm_role(id),
    CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

-- ============================================================
-- PERMISSIONS SUR LES NODE TYPES
-- ============================================================

-- Ce qu'un rôle peut faire sur un type de noeud
-- (lecture, écriture, transition lifecycle, création de lien...)
CREATE TABLE node_type_permission (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    role_id          VARCHAR(36)  NOT NULL REFERENCES plm_role(id),
    node_type_id     VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    can_read         SMALLINT     NOT NULL DEFAULT 1,
    can_write        SMALLINT     NOT NULL DEFAULT 0,  -- modif contenu
    can_transition   SMALLINT     NOT NULL DEFAULT 0,  -- changer état lifecycle
    can_sign         SMALLINT     NOT NULL DEFAULT 0,  -- signer
    can_create_link  SMALLINT     NOT NULL DEFAULT 0,
    can_baseline     SMALLINT     NOT NULL DEFAULT 0,  -- créer une baseline
    CONSTRAINT uq_role_nodetype UNIQUE (role_id, node_type_id)
);

-- ============================================================
-- VUES (organisation et restriction des attributs par rôle/état)
-- ============================================================

-- Définition d'une vue : nom + critères d'éligibilité
CREATE TABLE attribute_view (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    node_type_id     VARCHAR(36)  NOT NULL REFERENCES node_type(id),
    name             VARCHAR(100) NOT NULL,
    description      VARCHAR(500),
    -- Critères d'éligibilité : la vue s'active si role ET state correspondent
    -- NULL = s'applique à tous les rôles / états
    eligible_role_id  VARCHAR(36) REFERENCES plm_role(id),
    eligible_state_id VARCHAR(36) REFERENCES lifecycle_state(id),
    priority          INT         NOT NULL DEFAULT 0  -- plus haute priorité gagne
);

-- Overrides d'attributs dans une vue
-- Un override peut restreindre (mais jamais élargir) les droits de l'état courant
CREATE TABLE view_attribute_override (
    id              VARCHAR(36) NOT NULL PRIMARY KEY,
    view_id         VARCHAR(36) NOT NULL REFERENCES attribute_view(id),
    attribute_def_id VARCHAR(36) NOT NULL REFERENCES attribute_definition(id),
    visible         SMALLINT,   -- NULL = hérite de la règle état
    editable        SMALLINT,   -- NULL = hérite, mais jamais > règle état
    display_order   INT,        -- NULL = hérite
    display_section VARCHAR(100), -- NULL = hérite
    CONSTRAINT uq_view_attr UNIQUE (view_id, attribute_def_id)
);

-- ============================================================
-- PERMISSIONS SUR LES TRANSITIONS
-- ============================================================

-- Quels rôles peuvent déclencher quelle transition
CREATE TABLE transition_permission (
    id              VARCHAR(36) NOT NULL PRIMARY KEY,
    transition_id   VARCHAR(36) NOT NULL REFERENCES lifecycle_transition(id),
    role_id         VARCHAR(36) NOT NULL REFERENCES plm_role(id),
    CONSTRAINT uq_transition_role UNIQUE (transition_id, role_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_user_role_user   ON user_role(user_id);
CREATE INDEX idx_user_role_role   ON user_role(role_id);
CREATE INDEX idx_ntp_role         ON node_type_permission(role_id);
CREATE INDEX idx_ntp_nodetype     ON node_type_permission(node_type_id);
CREATE INDEX idx_view_nodetype    ON attribute_view(node_type_id);
CREATE INDEX idx_view_role        ON attribute_view(eligible_role_id);
CREATE INDEX idx_vao_view         ON view_attribute_override(view_id);
CREATE INDEX idx_tp_transition    ON transition_permission(transition_id);
CREATE INDEX idx_tp_role          ON transition_permission(role_id);
