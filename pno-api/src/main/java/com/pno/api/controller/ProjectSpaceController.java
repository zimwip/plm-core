package com.pno.api.controller;

import com.pno.domain.service.PnoEventPublisher;
import com.pno.domain.service.ProjectSpaceService;
import com.pno.infrastructure.security.PnoSecurityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/project-spaces")
@RequiredArgsConstructor
public class ProjectSpaceController {

    private final ProjectSpaceService projectSpaceService;
    private final PnoEventPublisher eventPublisher;

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String userId) {
        return ResponseEntity.ok(projectSpaceService.listProjectSpaces(userId));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        String name        = (String) body.get("name");
        String description = (String) body.get("description");
        String parentId    = (String) body.get("parentId");
        var ps = projectSpaceService.createProjectSpace(name, description, parentId);
        eventPublisher.projectSpaceChanged("CREATED", (String) ps.get("id"), currentUserId());
        return ResponseEntity.ok(ps);
    }

    @GetMapping("/{id}/descendants")
    public ResponseEntity<?> descendants(@PathVariable String id) {
        return ResponseEntity.ok(projectSpaceService.resolveDescendants(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivate(@PathVariable String id) {
        projectSpaceService.deactivateProjectSpace(id);
        eventPublisher.projectSpaceChanged("DEACTIVATED", id, currentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/service-tags")
    public ResponseEntity<?> serviceTags(@PathVariable String id) {
        return ResponseEntity.ok(projectSpaceService.getServiceTags(id));
    }

    @GetMapping("/{id}/effective-service-tags")
    public ResponseEntity<?> effectiveServiceTags(@PathVariable String id) {
        return ResponseEntity.ok(projectSpaceService.getEffectiveServiceTags(id));
    }

    @SuppressWarnings("unchecked")
    @PutMapping("/{id}/service-tags/{serviceCode}")
    public ResponseEntity<?> setServiceTags(@PathVariable String id,
                                            @PathVariable String serviceCode,
                                            @RequestBody Map<String, Object> body) {
        List<String> tags = (List<String>) body.get("tags");
        projectSpaceService.setServiceTags(id, serviceCode, tags);
        eventPublisher.projectSpaceChanged("SERVICE_TAGS_CHANGED", id, currentUserId());
        return ResponseEntity.ok(projectSpaceService.getServiceTags(id));
    }

    @PutMapping("/{id}/isolated")
    public ResponseEntity<?> setIsolated(@PathVariable String id,
                                         @RequestBody Map<String, Object> body) {
        boolean isolated = Boolean.TRUE.equals(body.get("isolated"));
        projectSpaceService.setIsolated(id, isolated);
        eventPublisher.projectSpaceChanged("ISOLATION_CHANGED", id, currentUserId());
        return ResponseEntity.noContent().build();
    }

    private String currentUserId() {
        var ctx = PnoSecurityContext.get();
        return ctx != null ? ctx.getUserId() : "unknown";
    }
}
