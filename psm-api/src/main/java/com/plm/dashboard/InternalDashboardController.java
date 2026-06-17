package com.plm.dashboard;

import com.plm.dashboard.internal.DashboardService;
import com.plm.platform.auth.JwtVerifier;
import com.plm.shared.security.PlmSecurityContext;
import com.plm.shared.security.PsmAuthContextBinder;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * S2S endpoint consumed by platform-api DashboardFederatorClient.
 * Returns normalized sections for this service's dashboard contribution.
 *
 * Security: PlmAuthFilter validates X-Service-Secret on /internal/**.
 * JWT is manually decoded here (same pattern as InternalTransactionController)
 * because the filter only binds X-Service-Secret context for internal routes.
 *
 *   GET /api/psm/internal/dashboard/entries
 */
@RestController
@RequestMapping("/internal/dashboard")
@RequiredArgsConstructor
public class InternalDashboardController {

    private final DashboardService      dashboardService;
    private final JwtVerifier           jwtVerifier;
    private final PsmAuthContextBinder  authContextBinder;

    @GetMapping("/entries")
    public List<Map<String, Object>> getEntries(HttpServletRequest req) {
        bindContext(req);
        try {
            String userId = PlmSecurityContext.get().getUserId();
            List<Map<String, Object>> sections = new ArrayList<>();

            // Transactions section
            Map<String, Object> txSection = new LinkedHashMap<>();
            txSection.put("type", "TRANSACTIONS");
            txSection.put("serviceCode", "psm");
            txSection.put("label", "Open transaction");
            Map<String, Object> txSummary = dashboardService.getOpenTransactionSummary(userId);
            if (txSummary != null) {
                txSection.put("txId",      txSummary.get("txId"));
                txSection.put("title",     txSummary.get("title"));
                txSection.put("createdAt", txSummary.get("createdAt"));
                txSection.put("items",     txSummary.getOrDefault("nodes", List.of()));
            } else {
                txSection.put("items", List.of());
            }
            sections.add(txSection);

            // Work items section
            Map<String, Object> workSection = new LinkedHashMap<>();
            workSection.put("type",        "WORK_ITEMS");
            workSection.put("serviceCode", "psm");
            workSection.put("label",       "Objects you can work on");
            workSection.put("hint",        "last 10 · sorted by available actions");
            workSection.put("items",       dashboardService.getWorkItems(userId));
            sections.add(workSection);

            return sections;
        } finally {
            authContextBinder.clear();
        }
    }

    private void bindContext(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return;
        // Forward JWTs now carry roleIds/perms/ps as claims — trust them directly.
        jwtVerifier.verify(auth.substring(7).trim())
            .ifPresent(p -> authContextBinder.bind(p, req));
    }
}
