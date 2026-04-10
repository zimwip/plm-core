-- ============================================================
-- PLM SCHEMA - V5 : Modèle de transaction enrichi
--
-- Changements par rapport à V1 :
--  - plm_transaction enrichie (comment au commit, statut complet)
--  - node_version.tx_id référence la transaction
--  - node_version.tx_status reflète le statut de visibilité
--  - plm_lock.tx_id reste la jointure principale
-- ============================================================

-- Supprimer l'ancienne table transaction (structure V1 trop simple)
-- On recrée avec la bonne sémantique
DROP TABLE plm_transaction;

CREATE TABLE plm_transaction (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY,
    owner_id     VARCHAR(100) NOT NULL,           -- utilisateur propriétaire
    status       VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
                                                  -- OPEN | COMMITTED | ROLLEDBACK
    title        VARCHAR(255),                    -- titre optionnel (ex: "Refonte géométrie")
    commit_comment VARCHAR(2000),                 -- commentaire saisi au commit
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    committed_at TIMESTAMP,
    -- Pas de rolled_back_at : le rollback supprime la transaction elle-même
    CONSTRAINT chk_tx_status CHECK (status IN ('OPEN', 'COMMITTED'))
);

-- Index : un seul OPEN par utilisateur (enforced applicativement + index partiel)
CREATE INDEX idx_tx_owner_status ON plm_transaction(owner_id, status);

-- ── Enrichir node_version avec la référence transaction ──────────────
--
-- tx_id     : transaction qui a produit cette version (NULL = version initiale ou auto-committed)
-- tx_status : OPEN (dans une tx non committée) | COMMITTED (visible par tous)
--
-- Note : il n'y a pas de statut ROLLEDBACK.
-- Les versions d'une transaction annulée sont supprimées physiquement.
-- Le noeud retrouve exactement son état avant le checkin.
--
ALTER TABLE node_version ADD COLUMN tx_id VARCHAR(36) REFERENCES plm_transaction(id);
ALTER TABLE node_version ADD COLUMN tx_status VARCHAR(20) DEFAULT 'COMMITTED'
    CONSTRAINT chk_tx_status CHECK (tx_status IN ('OPEN', 'COMMITTED'));

CREATE INDEX idx_node_version_tx ON node_version(tx_id);
CREATE INDEX idx_tx_status       ON node_version(tx_status);
