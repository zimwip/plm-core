package com.pno.api.controller;

import com.pno.domain.service.ProjectSpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
