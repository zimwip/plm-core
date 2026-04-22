package com.plm.platform.spe.registry;

import com.plm.platform.spe.SpeRegistrationProperties;
import com.plm.platform.spe.dto.RegistrySnapshot;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Receives registry snapshot pushes from spe-api.
 * Secured via X-Service-Secret (same shared secret as registration).
 */
@Slf4j
@RestController
@RequestMapping("/internal/registry")
public class RegistryUpdateController {

    private final LocalServiceRegistry localRegistry;
    private final SpeRegistrationProperties props;

    public RegistryUpdateController(LocalServiceRegistry localRegistry, SpeRegistrationProperties props) {
        this.localRegistry = localRegistry;
        this.props = props;
    }

    @PostMapping("/update")
    public ResponseEntity<Void> receiveUpdate(
            @RequestHeader("X-Service-Secret") String secret,
            @RequestBody RegistrySnapshot snapshot) {
        if (!props.serviceSecret().equals(secret)) {
            log.warn("Registry push rejected: invalid X-Service-Secret");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        localRegistry.updateFromSnapshot(snapshot);
        log.debug("Received registry push v{} ({} services)", snapshot.version(),
            snapshot.services() != null ? snapshot.services().size() : 0);
        return ResponseEntity.ok().build();
    }
}
