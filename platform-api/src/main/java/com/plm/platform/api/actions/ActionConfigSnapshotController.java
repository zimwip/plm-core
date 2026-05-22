package com.plm.platform.api.actions;

import com.plm.platform.api.actions.ActionConfigSnapshotService.ActionConfigSnapshot;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal endpoint: serves full action + algorithm + permission snapshot for a service.
 * Called by psm-admin at snapshot-build time so psm-api gets all cross-cutting config from platform.
 * Transition guards are NOT here — they are admin config owned by psm-admin.
 */
@RestController
@RequiredArgsConstructor
public class ActionConfigSnapshotController {

    private final ActionConfigSnapshotService snapshotService;

    @GetMapping("/internal/config/actions")
    public ResponseEntity<ActionConfigSnapshot> getActionConfigSnapshot(
            @RequestParam(required = false) String serviceCode) {
        return ResponseEntity.ok(snapshotService.buildSnapshot(serviceCode));
    }
}
