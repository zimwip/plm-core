package com.plm.node;

import com.plm.platform.action.dto.ItemTypeDescriptor;
import com.plm.platform.config.ConfigCache;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/item-type")
@RequiredArgsConstructor
public class ItemTypeController {

    private final NodeService  nodeService;
    private final ConfigCache  configCache;

    @GetMapping("/{nodeTypeId}")
    public ResponseEntity<ItemTypeDescriptor> get(@PathVariable String nodeTypeId)
            throws InterruptedException {
        if (!configCache.isPopulated()) {
            configCache.awaitPopulated(10, TimeUnit.SECONDS);
        }
        return ResponseEntity.ok(nodeService.buildNodeTypeDescriptor(nodeTypeId));
    }
}
