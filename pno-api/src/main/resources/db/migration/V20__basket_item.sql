-- Dedicated basket table — first-class citizen, independent of user_kv.
-- ps_id = project-space id; source = service code (e.g. "psm"); type_code = item type.
CREATE TABLE basket_item (
    id          VARCHAR(36)   NOT NULL,
    user_id     VARCHAR(36)   NOT NULL REFERENCES pno_user(id),
    ps_id       VARCHAR(36)   NOT NULL,
    source      VARCHAR(64)   NOT NULL,
    type_code   VARCHAR(256)  NOT NULL,
    item_id     VARCHAR(1024) NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT basket_item_pkey PRIMARY KEY (id),
    CONSTRAINT basket_item_unique UNIQUE (user_id, ps_id, source, type_code, item_id)
);

CREATE INDEX idx_basket_item_lookup ON basket_item (user_id, ps_id);

-- Migrate existing basket data from user_kv into basket_item.
-- Key format in user_kv was "source:typeCode".
INSERT INTO basket_item (id, user_id, ps_id, source, type_code, item_id, created_at)
SELECT
    id,
    user_id,
    ps_id,
    CASE WHEN POSITION(':' IN kv_key) > 0 THEN SUBSTRING(kv_key, 1, POSITION(':' IN kv_key) - 1) ELSE kv_key END,
    CASE WHEN POSITION(':' IN kv_key) > 0 THEN SUBSTRING(kv_key, POSITION(':' IN kv_key) + 1) ELSE '' END,
    kv_value,
    created_at
FROM user_kv
WHERE group_name = 'BASKET';

DELETE FROM user_kv WHERE group_name = 'BASKET';
