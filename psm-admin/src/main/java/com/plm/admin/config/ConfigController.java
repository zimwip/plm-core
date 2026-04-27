package com.plm.admin.config;

import com.plm.platform.config.dto.ConfigSnapshot;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal REST endpoint for config snapshot retrieval.
 * psm-data instances pull snapshots at startup and on NATS CONFIG_CHANGED notifications.
 *
 * X-Service-Secret header validated by PlmAdminAuthFilter for /internal/** paths.
 */
@RestController
@RequestMapping("/internal/config")
@RequiredArgsConstructor
public class ConfigController {

    private final ConfigSnapshotBuilder snapshotBuilder;

    @GetMapping("/snapshot")
    public ResponseEntity<ConfigSnapshot> getSnapshot() {
        return ResponseEntity.ok(snapshotBuilder.buildFullSnapshot());
    }
}
