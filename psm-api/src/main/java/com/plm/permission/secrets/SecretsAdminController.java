package com.plm.permission.secrets;

import com.plm.platform.vault.VaultAdminClient;
import com.plm.shared.authorization.PlmPermission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Administrate Vault-backed secrets via Settings → Platform → Secrets.
 * All mutations gated on MANAGE_SECRETS.
 *
 * Values are NEVER returned from the list endpoint — reveal is a separate
 * per-key GET, so the UI masks by default.
 */
@RestController
@RequestMapping("/api/psm/admin/secrets")
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
    @PlmPermission("MANAGE_SECRETS")
    public ResponseEntity<List<SecretKeyDto>> list() {
        if (vault == null) return ResponseEntity.status(503).build();
        List<SecretKeyDto> out = new ArrayList<>();
        for (String k : vault.listKeys()) out.add(new SecretKeyDto(k));
        return ResponseEntity.ok(out);
    }

    @GetMapping("/{key}")
    @PlmPermission("MANAGE_SECRETS")
    public ResponseEntity<SecretDto> reveal(@PathVariable String key) {
        if (vault == null) return ResponseEntity.status(503).build();
        Object v = vault.read(key);
        if (v == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(new SecretDto(key, String.valueOf(v)));
    }

    @PostMapping
    @PlmPermission("MANAGE_SECRETS")
    public ResponseEntity<Void> create(@RequestBody CreateRequest req) {
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
    @PlmPermission("MANAGE_SECRETS")
    public ResponseEntity<Void> update(@PathVariable String key, @RequestBody UpdateRequest req) {
        if (vault == null) return ResponseEntity.status(503).build();
        vault.write(key, req.value() == null ? "" : req.value());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{key}")
    @PlmPermission("MANAGE_SECRETS")
    public ResponseEntity<Void> delete(@PathVariable String key) {
        if (vault == null) return ResponseEntity.status(503).build();
        vault.delete(key);
        return ResponseEntity.noContent().build();
    }
}
