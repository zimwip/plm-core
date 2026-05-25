package com.plm.platform.api.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Aggregates dashboard sections from all services that declared the "dashboard"
 * feature. The frontend calls this single endpoint instead of per-service
 * dashboard routes.
 *
 * URL: GET /api/platform/dashboard/entries
 */
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardFederatorController {

    private final DashboardFederatorClient federatorClient;

    @GetMapping("/entries")
    public List<Map<String, Object>> getEntries() {
        return federatorClient.fetchEntries();
    }
}
