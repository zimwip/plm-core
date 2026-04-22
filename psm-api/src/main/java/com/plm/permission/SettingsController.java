package com.plm.permission;

import com.plm.permission.internal.PermissionAdminService;
import com.plm.shared.settings.SettingGroup;
import com.plm.shared.settings.SettingSection;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/psm/admin")
@RequiredArgsConstructor
public class SettingsController {

    private final List<SettingSection> allSections;
    private final PermissionAdminService permissionAdminService;

    @GetMapping("/settings-sections")
    public ResponseEntity<List<GroupedSections>> getSettingsSections() {
        Set<String> userPerms = new HashSet<>(permissionAdminService.getExecutableGlobalPermissions());

        List<SettingSection> visible = allSections.stream()
                .filter(s -> s.permission() == null || userPerms.contains(s.permission()))
                .toList();

        List<GroupedSections> grouped = Arrays.stream(SettingGroup.values())
                .map(g -> new GroupedSections(
                        g.name(),
                        g.label(),
                        visible.stream()
                                .filter(s -> s.group() == g)
                                .sorted(Comparator.comparingInt(SettingSection::order))
                                .map(s -> new SectionDto(s.key(), s.label(),
                                        s.permission() == null || userPerms.contains(s.permission())))
                                .toList()))
                .filter(g -> !g.sections().isEmpty())
                .toList();

        return ResponseEntity.ok(grouped);
    }

    public record GroupedSections(String groupKey, String groupLabel, List<SectionDto> sections) {}
    public record SectionDto(String key, String label, boolean canWrite) {}
}
