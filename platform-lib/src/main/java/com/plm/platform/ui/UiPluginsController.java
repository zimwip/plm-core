package com.plm.platform.ui;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Internal endpoint exposing this service's declared UI plugin descriptors.
 * Auto-configured by {@link UiPluginsAutoConfiguration} when {@code plm.ui.enabled=true}.
 * Protected by {@code X-Service-Secret} (applied globally by PlmAuthFilter).
 */
@RestController
@RequestMapping("/internal/ui")
@RequiredArgsConstructor
public class UiPluginsController {

    private final List<UiPluginDeclaration> plugins;

    @GetMapping("/plugins")
    public ResponseEntity<List<UiPluginDeclaration>> plugins() {
        return ResponseEntity.ok(plugins);
    }
}
