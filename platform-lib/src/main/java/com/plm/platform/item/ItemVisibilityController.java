package com.plm.platform.item;

import com.plm.platform.item.dto.ItemDescriptor;
import com.plm.platform.item.dto.ItemVisibilityContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * Service-to-service endpoint mounted by platform-lib in every service that
 * contributes {@link ItemCatalogContribution} beans.
 *
 * <p>platform-api fans out to {@code POST /internal/items/visible} on each
 * registered service with an {@link ItemVisibilityContext} body; the
 * service-supplied {@link ItemVisibilityResolver} returns each descriptor
 * with disallowed actions nulled out (or null entirely if no action remains
 * for the user). The controller drops empty descriptors from the response.
 *
 * <p>{@code X-Service-Secret} authentication is applied by {@code PlmAuthFilter}
 * via the {@code /internal/**} convention.
 */
@Slf4j
@RestController
@RequestMapping("/internal/items")
public class ItemVisibilityController {

    private final List<ItemCatalogContribution> contributions;
    private final ItemVisibilityResolver resolver;

    public ItemVisibilityController(List<ItemCatalogContribution> contributions,
                                    ItemVisibilityResolver resolver) {
        this.contributions = contributions;
        this.resolver = resolver;
    }

    @PostMapping("/visible")
    public ResponseEntity<List<ItemDescriptor>> visible(@RequestBody ItemVisibilityContext context) {
        List<ItemDescriptor> all = new ArrayList<>();
        for (ItemCatalogContribution c : contributions) {
            List<ItemDescriptor> ds = c.descriptors();
            if (ds != null) all.addAll(ds);
        }
        if (context != null && context.admin()) {
            return ResponseEntity.ok(all);
        }

        List<ItemDescriptor> kept = new ArrayList<>(all.size());
        for (ItemDescriptor d : all) {
            ItemDescriptor filtered = resolver.filter(context, d);
            if (filtered != null && filtered.hasAnyAction()) {
                kept.add(filtered);
            }
        }
        return ResponseEntity.ok(kept);
    }
}
