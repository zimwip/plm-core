package com.plm.platform.api.secrets;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.plm.platform.vault.VaultAdminClient;
import com.plm.platform.api.security.SettingsSecurityContext;
import com.plm.platform.api.security.SettingsUserContext;

/**
 * Vault-backed secret administration. Admin-only (platform-api enforces via
 * JWT isAdmin flag — no per-permission grants in this service).
 *
 * Values are NEVER returned from the list endpoint — reveal is a separate
 * per-key GET, so the UI masks by default.
 */
@RestController
@RequestMapping("/admin/secrets")
public class SecretsAdminController {

    private final VaultAdminClient vault;

    public SecretsAdminController(@Autowired(required = false) VaultAdminClient vault) {
        this.vault = vault;
    }

    public record SecretKeyDto(String key) {}
    public record SecretDto(String key, String value) {}
    public record CreateRequest(String key, String value) {}
    public record UpdateRequest(String value) {}

    @GetMapping
    public ResponseEntity<List<SecretKeyDto>> list() {
        if (requireAdmin() != null) return forbid();
        if (vault == null) return ResponseEntity.status(503).build();
        List<SecretKeyDto> out = new ArrayList<>();
        for (String k : vault.listKeys()) out.add(new SecretKeyDto(k));
        return ResponseEntity.ok(out);
    }

    @GetMapping("/{key}")
    public ResponseEntity<SecretDto> reveal(@PathVariable String key) {
        if (requireAdmin() != null) return forbid();
        if (vault == null) return ResponseEntity.status(503).build();
        Object v = vault.read(key);
        if (v == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(new SecretDto(key, String.valueOf(v)));
    }

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody CreateRequest req) {
        if (requireAdmin() != null) return forbid();
        if (vault == null) return ResponseEntity.status(503).build();
        if (req.key() == null || req.key().isBlank()) return ResponseEntity.badRequest().build();
        try {
            vault.create(req.key(), req.value() == null ? "" : req.value());
        } catch (IllegalStateException alreadyExists) {
            return ResponseEntity.status(409).build();
        }
        return ResponseEntity.status(201).build();
    }

    @PutMapping("/{key}")
    public ResponseEntity<Void> update(@PathVariable String key, @RequestBody UpdateRequest req) {
        if (requireAdmin() != null) return forbid();
        if (vault == null) return ResponseEntity.status(503).build();
        vault.write(key, req.value() == null ? "" : req.value());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<Void> delete(@PathVariable String key) {
        if (requireAdmin() != null) return forbid();
        if (vault == null) return ResponseEntity.status(503).build();
        vault.delete(key);
        return ResponseEntity.noContent().build();
    }

    private static String requireAdmin() {
        SettingsUserContext u = SettingsSecurityContext.getOrNull();
        if (u == null || !u.isAdmin()) return "MANAGE_SECRETS requires admin";
        return null;
    }

    private static <T> ResponseEntity<T> forbid() {
        return ResponseEntity.status(403).build();
    }
}
