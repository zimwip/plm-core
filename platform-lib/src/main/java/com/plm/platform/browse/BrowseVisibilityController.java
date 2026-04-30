package com.plm.platform.browse;

import com.plm.platform.browse.dto.ListableDescriptor;
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
 * contributes {@link ListableContribution} beans.
 *
 * <p>platform-api fans out to {@code POST /internal/browse/visible} on each
 * registered service with a {@link ResourceVisibilityContext}; the
 * service-supplied {@link BrowseVisibilityResolver} returns the subset of its
 * descriptors visible to that user. {@code X-Service-Secret} is applied via
 * the {@code /internal/**} convention.
 */
@Slf4j
@RestController
@RequestMapping("/internal/browse")
public class BrowseVisibilityController {

    private final List<ListableContribution> contributions;
    private final BrowseVisibilityResolver resolver;

    public BrowseVisibilityController(List<ListableContribution> contributions,
                                      BrowseVisibilityResolver resolver) {
        this.contributions = contributions;
        this.resolver = resolver;
    }

    @PostMapping("/visible")
    public ResponseEntity<List<ListableDescriptor>> visible(@RequestBody ResourceVisibilityContext context) {
        List<ListableDescriptor> all = new ArrayList<>();
        for (ListableContribution c : contributions) {
            List<ListableDescriptor> ds = c.descriptors();
            if (ds != null) all.addAll(ds);
        }
        if (context != null && context.admin()) {
            return ResponseEntity.ok(all);
        }
        return ResponseEntity.ok(resolver.filter(context, all));
    }
}
