package com.plm.platform.vault;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;
import org.springframework.vault.core.VaultKeyValueOperations;
import org.springframework.vault.core.VaultKeyValueOperationsSupport.KeyValueBackend;
import org.springframework.vault.core.VaultTemplate;
import org.springframework.vault.support.VaultResponseSupport;

import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Thin CRUD wrapper around Vault KV v2 at path {@code secret/plm}. Used by
 * psm-api's SecretsAdminController to power the Settings → Platform →
 * Secrets UI.
 *
 * Auto-registered as a bean when Spring Cloud Vault provides a
 * VaultTemplate — services without Vault configuration simply don't expose
 * secret administration endpoints.
 */
@Slf4j
@Component
@ConditionalOnBean(VaultTemplate.class)
public class VaultAdminClient {

    private static final String BACKEND = "secret";
    private static final String PATH    = "plm";

    private final VaultKeyValueOperations kv;

    public VaultAdminClient(VaultTemplate vaultTemplate) {
        this.kv = vaultTemplate.opsForKeyValue(BACKEND, KeyValueBackend.KV_2);
    }

    /** Full map of key → value (plaintext). */
    public Map<String, Object> readAll() {
        VaultResponseSupport<Map<String, Object>> resp = kv.get(PATH, parameterizedMapType());
        if (resp == null || resp.getData() == null) return Collections.emptyMap();
        return new LinkedHashMap<>(resp.getData());
    }

    /** Key names only (for masked listing). */
    public List<String> listKeys() {
        return List.copyOf(readAll().keySet());
    }

    /** Single value or null if absent. */
    public Object read(String key) {
        return readAll().get(key);
    }

    /** Upsert single key. Preserves all other keys under secret/plm. */
    public void write(String key, Object value) {
        Map<String, Object> current = new LinkedHashMap<>(readAll());
        current.put(key, value);
        kv.put(PATH, current);
        log.info("Vault: wrote key '{}'", key);
    }

    /** Create if absent, throw if present. */
    public void create(String key, Object value) {
        Map<String, Object> current = new LinkedHashMap<>(readAll());
        if (current.containsKey(key)) {
            throw new IllegalStateException("Secret key already exists: " + key);
        }
        current.put(key, value);
        kv.put(PATH, current);
        log.info("Vault: created key '{}'", key);
    }

    /** Remove single key. No-op if absent. */
    public void delete(String key) {
        Map<String, Object> current = new LinkedHashMap<>(readAll());
        if (current.remove(key) != null) {
            kv.put(PATH, current);
            log.info("Vault: deleted key '{}'", key);
        }
    }

    @SuppressWarnings({ "unchecked", "rawtypes" })
    private static Class<Map<String, Object>> parameterizedMapType() {
        return (Class) HashMap.class;
    }
}
