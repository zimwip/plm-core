package com.plm.node;

import com.plm.platform.action.dto.LinkTypeDescriptor;
import com.plm.platform.config.ConfigCache;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/link-type")
@RequiredArgsConstructor
public class LinkTypeController {

    private final NodeService nodeService;
    private final ConfigCache configCache;

    @GetMapping("/{linkTypeId}")
    public ResponseEntity<LinkTypeDescriptor> get(@PathVariable String linkTypeId)
            throws InterruptedException {
        if (!configCache.isPopulated()) {
            configCache.awaitPopulated(10, TimeUnit.SECONDS);
        }
        return ResponseEntity.ok(nodeService.buildLinkTypeDescriptor(linkTypeId));
    }
}
