package com.pno.api.controller;

import com.pno.domain.service.AccessTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Service-to-service token verification (X-Service-Secret via PlmAuthFilter
 * secret-paths /internal/**). Called by spe-api when translating Basic auth
 * on /api/dav into a forward JWT.
 */
@RestController
@RequestMapping("/internal/tokens")
@RequiredArgsConstructor
public class InternalTokenController {

    private final AccessTokenService tokenService;

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@RequestBody Map<String, String> body) {
        boolean valid = tokenService.verify(body.get("userId"), body.get("token"));
        return ResponseEntity.ok(Map.of("valid", valid));
    }
}
