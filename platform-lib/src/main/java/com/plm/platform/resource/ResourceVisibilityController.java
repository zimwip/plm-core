package com.plm.platform.resource;

import com.plm.platform.resource.dto.ResourceDescriptor;
import com.plm.platform.resource.dto.ResourceVisibilityContext;
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
 * contributes {@link ResourceCatalogContribution} beans.
 *
 * <p>platform-api fans out to {@code POST /internal/resources/visible} on each
 * registered service with a {@link ResourceVisibilityContext} body; the
 * service-supplied {@link ResourceVisibilityResolver} returns the subset of its
 * descriptors visible to that user. {@code X-Service-Secret} authentication is
 * applied by {@code PlmAuthFilter} via the {@code /internal/**} convention.
 */
@Slf4j
@RestController
@RequestMapping("/internal/resources")
public class ResourceVisibilityController {

    private final List<ResourceCatalogContribution> contributions;
    private final ResourceVisibilityResolver resolver;

    public ResourceVisibilityController(List<ResourceCatalogContribution> contributions,
                                        ResourceVisibilityResolver resolver) {
        this.contributions = contributions;
        this.resolver = resolver;
    }

    @PostMapping("/visible")
    public ResponseEntity<List<ResourceDescriptor>> visible(@RequestBody ResourceVisibilityContext context) {
        List<ResourceDescriptor> all = new ArrayList<>();
        for (ResourceCatalogContribution c : contributions) {
            List<ResourceDescriptor> ds = c.descriptors();
            if (ds != null) all.addAll(ds);
        }
        if (context != null && context.admin()) {
            return ResponseEntity.ok(all);
        }
        return ResponseEntity.ok(resolver.filter(context, all));
    }
}
