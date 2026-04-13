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
    public ResponseEntity<?> list() {
        return ResponseEntity.ok(projectSpaceService.listProjectSpaces());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        String name        = (String) body.get("name");
        String description = (String) body.get("description");
        return ResponseEntity.ok(projectSpaceService.createProjectSpace(name, description));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivate(@PathVariable String id) {
        projectSpaceService.deactivateProjectSpace(id);
        return ResponseEntity.noContent().build();
    }
}
