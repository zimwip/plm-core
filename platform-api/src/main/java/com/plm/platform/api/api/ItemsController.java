package com.plm.platform.api.api;

import com.plm.platform.api.client.PnoApiClient;
import com.plm.platform.api.security.SettingsSecurityContext;
import com.plm.platform.api.security.SettingsUserContext;
import com.plm.platform.environment.PlatformRegistrationProperties;
import com.plm.platform.item.dto.ItemDescriptor;
import com.plm.platform.item.dto.ItemVisibilityContext;
import com.plm.platform.PlatformPaths;
import com.plm.platform.client.ServiceClient;
import com.plm.platform.registry.LocalServiceRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

/**
 * Frontend-facing federated item catalog. Replaces the previous
 * {@code /resources} (create axis) + {@code /browse} (list/get axis) split
 * with a single endpoint that returns one descriptor per item, each
 * carrying the actions ({@code create}, {@code list}, {@code get}) the
 * caller is permitted to perform.
 *
 * <p>Fans out in parallel to every known service via the platform-lib
 * {@link ServiceClient} (registry-aware, Resilience4j wrapped, traced) and
 * merges each source's {@code /internal/items/visible} answer.
 *
 * <p>No caching at the platform-api level: each request hits every source
 * service live. Per-action enforcement is owned by the source — psm checks
 * {@code CREATE_NODE} / {@code READ_NODE} per nodeType, dst checks
 * {@code WRITE_DATA} / {@code READ_DATA}. Platform-api carries no policy of
 * its own; if a source call fails the controller fails closed (returns
 * empty for that source) rather than leaking unfiltered descriptors.
 */
@Slf4j
@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
public class ItemsController {

    private final PnoApiClient pnoApiClient;
    private final ServiceClient serviceClient;
    private final LocalServiceRegistry registry;
    private final PlatformRegistrationProperties platformProps;

    @GetMapping
    public ResponseEntity<List<ItemDescriptor>> list(
            @RequestHeader(value = "X-PLM-ProjectSpace", required = false) String projectSpaceId) {
        SettingsUserContext ctx = SettingsSecurityContext.get();
        boolean admin = ctx.isAdmin();

        SettingsUserContext fetched = pnoApiClient.getUserContext(ctx.getUserId(), projectSpaceId);
        Set<String> globalPerms = Optional.ofNullable(fetched)
            .map(SettingsUserContext::getGlobalPermissions)
            .orElse(Set.of());
        Set<String> roleIds = Optional.ofNullable(fetched)
            .map(SettingsUserContext::getRoleIds)
            .orElse(Set.of());

        ItemVisibilityContext visibility = new ItemVisibilityContext(
            ctx.getUserId(), projectSpaceId, admin, roleIds, globalPerms);

        awaitRegistry();
        Set<String> serviceCodes = registry.allServiceCodes();
        String selfCode = platformProps.serviceCode();
        log.debug("Item fan-out across services: {}", serviceCodes);
        List<CompletableFuture<List<ItemDescriptor>>> futures = new ArrayList<>(serviceCodes.size());
        for (String code : serviceCodes) {
            if (code.equals(selfCode)) continue; // skip platform-api itself
            futures.add(CompletableFuture.supplyAsync(() -> fetchVisible(code, visibility)));
        }

        List<ItemDescriptor> merged = new ArrayList<>();
        for (CompletableFuture<List<ItemDescriptor>> f : futures) {
            try {
                List<ItemDescriptor> part = f.get();
                if (part != null) merged.addAll(part);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (ExecutionException e) {
                log.warn("Item visibility fan-out failed: {}",
                    e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
            }
        }
        return ResponseEntity.ok(merged);
    }

    private void awaitRegistry() {
        if (registry.isPopulated()) return;
        try {
            if (!registry.awaitPopulated(15, TimeUnit.SECONDS)) {
                log.warn("LocalServiceRegistry still empty after 15s — fan-out will return no results");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private List<ItemDescriptor> fetchVisible(String serviceCode, ItemVisibilityContext context) {
        String path = PlatformPaths.internalPath(serviceCode, "/items/visible");
        try {
            List<ItemDescriptor> body = serviceClient.post(serviceCode, path, context,
                new ParameterizedTypeReference<List<ItemDescriptor>>() {});
            int n = body != null ? body.size() : 0;
            log.info("Item fan-out → {} returned {} descriptor(s)", serviceCode, n);
            return body != null ? body : List.of();
        } catch (HttpClientErrorException.NotFound nf) {
            // Service does not expose /internal/items/visible — has no
            // ItemCatalogContribution beans. Expected for psa, pno, ws, etc.
            log.debug("Item fan-out → {} has no contributions (404)", serviceCode);
            return List.of();
        } catch (HttpClientErrorException e) {
            HttpStatusCode status = e.getStatusCode();
            log.warn("Item fan-out → {} failed (HTTP {}): {}", serviceCode, status.value(), e.getMessage());
            return List.of();
        } catch (Exception e) {
            // Any other failure (timeout, circuit-breaker open, IO, …) — fail
            // closed for this source; other sources merge unaffected.
            log.warn("Item fan-out → {} failed: {}", serviceCode, e.getMessage());
            return List.of();
        }
    }
}
