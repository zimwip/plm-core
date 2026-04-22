package com.pno.api.controller;

import com.pno.domain.service.ProjectSpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pno/project-spaces")
@RequiredArgsConstructor
public class ProjectSpaceController {

    private final ProjectSpaceService projectSpaceService;

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String userId) {
        return ResponseEntity.ok(projectSpaceService.listProjectSpaces(userId));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        String name        = (String) body.get("name");
        String description = (String) body.get("description");
        String parentId    = (String) body.get("parentId");
        return ResponseEntity.ok(projectSpaceService.createProjectSpace(name, description, parentId));
    }

    /**
     * Returns the target space + all descendant space IDs.
     * Used by PSM for node visibility: connected to parent → see children.
     */
    @GetMapping("/{id}/descendants")
    public ResponseEntity<?> descendants(@PathVariable String id) {
        return ResponseEntity.ok(projectSpaceService.resolveDescendants(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivate(@PathVariable String id) {
        projectSpaceService.deactivateProjectSpace(id);
        return ResponseEntity.noContent().build();
    }

    // ── Service tag configuration ──────────────────────────────────

    /** Own tags for a project space, grouped by service code. */
    @GetMapping("/{id}/service-tags")
    public ResponseEntity<?> serviceTags(@PathVariable String id) {
        return ResponseEntity.ok(projectSpaceService.getServiceTags(id));
    }

    /** Effective tags (with hierarchy inheritance) + isolated flag. Used by SPE for routing. */
    @GetMapping("/{id}/effective-service-tags")
    public ResponseEntity<?> effectiveServiceTags(@PathVariable String id) {
        return ResponseEntity.ok(projectSpaceService.getEffectiveServiceTags(id));
    }

    /** Set tags for a specific service on a project space. */
    @SuppressWarnings("unchecked")
    @PutMapping("/{id}/service-tags/{serviceCode}")
    public ResponseEntity<?> setServiceTags(@PathVariable String id,
                                            @PathVariable String serviceCode,
                                            @RequestBody Map<String, Object> body) {
        List<String> tags = (List<String>) body.get("tags");
        projectSpaceService.setServiceTags(id, serviceCode, tags);
        return ResponseEntity.ok(projectSpaceService.getServiceTags(id));
    }

    /** Toggle isolated flag. */
    @PutMapping("/{id}/isolated")
    public ResponseEntity<?> setIsolated(@PathVariable String id,
                                         @RequestBody Map<String, Object> body) {
        boolean isolated = Boolean.TRUE.equals(body.get("isolated"));
        projectSpaceService.setIsolated(id, isolated);
        return ResponseEntity.noContent().build();
    }
}
