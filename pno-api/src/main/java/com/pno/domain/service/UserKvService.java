package com.pno.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Generic per-user key/value store backed by {@code user_kv}.
 *
 * <p>Entries are set-based: (user_id, ps_id, group_name, kv_key, kv_value) is unique.
 * A group can hold many keys; each key can hold many values (multivalue).
 *
 * <p>ps_id = '' for user-global groups (UI_PREF), project-space id for scoped groups (BASKET).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserKvService {

    private final DSLContext dsl;

    /** Returns all entries for a group as [{key, value}] pairs. */
    public List<Map<String, Object>> listGroup(String userId, String psId, String group) {
        return dsl.fetch(
            "SELECT kv_key AS key, kv_value AS value FROM user_kv " +
            "WHERE user_id = ? AND ps_id = ? AND group_name = ? ORDER BY kv_key, created_at",
            userId, psId, group
        ).intoMaps();
    }

    /** Returns all values stored under a specific key in a group. */
    public List<String> listValues(String userId, String psId, String group, String key) {
        return dsl.fetch(
            "SELECT kv_value FROM user_kv WHERE user_id = ? AND ps_id = ? AND group_name = ? AND kv_key = ? ORDER BY created_at",
            userId, psId, group, key
        ).map(r -> r.get(0, String.class));
    }

    /** Returns the first value for a key, useful for single-value semantics (e.g. UI_PREF). */
    public Optional<String> getSingleValue(String userId, String psId, String group, String key) {
        return listValues(userId, psId, group, key).stream().findFirst();
    }

    /** Adds an entry (no-op if already present). */
    @Transactional
    public void put(String userId, String psId, String group, String key, String value) {
        int updated = dsl.execute(
            "INSERT INTO user_kv (id, user_id, ps_id, group_name, kv_key, kv_value, created_at) VALUES (?,?,?,?,?,?,?) " +
            "ON CONFLICT (user_id, ps_id, group_name, kv_key, kv_value) DO NOTHING",
            UUID.randomUUID().toString(), userId, psId, group, key, value, LocalDateTime.now()
        );
        if (updated > 0) {
            log.debug("user_kv put: user={} ps={} group={} key={}", userId, psId, group, key);
        }
    }

    /**
     * Sets a single-value key: removes any existing value for this key then inserts the new one.
     * Use for single-valued preferences like theme.
     */
    @Transactional
    public void setSingleValue(String userId, String psId, String group, String key, String value) {
        dsl.execute(
            "DELETE FROM user_kv WHERE user_id = ? AND ps_id = ? AND group_name = ? AND kv_key = ?",
            userId, psId, group, key
        );
        dsl.execute(
            "INSERT INTO user_kv (id, user_id, ps_id, group_name, kv_key, kv_value, created_at) VALUES (?,?,?,?,?,?,?)",
            UUID.randomUUID().toString(), userId, psId, group, key, value, LocalDateTime.now()
        );
        log.debug("user_kv setSingle: user={} ps={} group={} key={} value={}", userId, psId, group, key, value);
    }

    /** Removes one specific entry. */
    @Transactional
    public void delete(String userId, String psId, String group, String key, String value) {
        int removed = dsl.execute(
            "DELETE FROM user_kv WHERE user_id = ? AND ps_id = ? AND group_name = ? AND kv_key = ? AND kv_value = ?",
            userId, psId, group, key, value
        );
        log.debug("user_kv delete: user={} ps={} group={} key={} removed={}", userId, psId, group, key, removed);
    }

    /** Removes all entries for a group (empty basket). */
    @Transactional
    public void deleteGroup(String userId, String psId, String group) {
        int removed = dsl.execute(
            "DELETE FROM user_kv WHERE user_id = ? AND ps_id = ? AND group_name = ?",
            userId, psId, group
        );
        log.debug("user_kv deleteGroup: user={} ps={} group={} removed={}", userId, psId, group, removed);
    }
}
