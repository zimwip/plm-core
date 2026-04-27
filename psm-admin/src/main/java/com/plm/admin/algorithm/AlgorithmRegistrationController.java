package com.plm.admin.algorithm;

import com.plm.platform.algorithm.dto.AlgorithmRegistrationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Receives algorithm catalog from runtime services (e.g. psm-api) on startup.
 * X-Service-Secret validated by PlmAdminAuthFilter for /internal/** paths.
 */
@RestController
@RequestMapping("/internal/algorithms")
@RequiredArgsConstructor
public class AlgorithmRegistrationController {

    private final AlgorithmRegistrationService service;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody AlgorithmRegistrationRequest req) {
        service.registerCatalog(req);
        return ResponseEntity.noContent().build();
    }
}
