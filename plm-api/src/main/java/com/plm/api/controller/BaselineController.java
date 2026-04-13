package com.plm.api.controller;

import com.plm.domain.service.BaselineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/psm/baselines")
@RequiredArgsConstructor
public class BaselineController {

    private final BaselineService baselineService;

    @GetMapping
    public ResponseEntity<?> listBaselines() {
        return ResponseEntity.ok(baselineService.listBaselines());
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createBaseline(@RequestBody Map<String, String> body) {
        String id = baselineService.createBaseline(
            body.get("rootNodeId"),
            body.get("name"),
            body.get("description"),
            body.get("userId")
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<?> getContent(@PathVariable String id) {
        return ResponseEntity.ok(baselineService.getBaselineContent(id));
    }

    @GetMapping("/compare")
    public ResponseEntity<?> compare(
        @RequestParam String baselineA,
        @RequestParam String baselineB
    ) {
        return ResponseEntity.ok(baselineService.compareBaselines(baselineA, baselineB));
    }
}
