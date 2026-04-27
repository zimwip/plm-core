package com.plm.platform.api.api;

import com.plm.platform.settings.dto.SettingSectionDto;
import com.plm.platform.api.client.PnoApiClient;
import com.plm.platform.api.registry.SettingsSectionRegistry;
import com.plm.platform.api.security.SettingsSecurityContext;
import com.plm.platform.api.security.SettingsUserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Frontend-facing endpoint returning grouped settings sections filtered by user permissions.
 * Aggregates sections from all registered PLM services.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class SettingsSectionsController {

    private static final List<GroupDef> GROUPS = List.of(
        new GroupDef("GENERAL",     "General"),
        new GroupDef("PNO",         "PnO"),
        new GroupDef("PLATFORM",    "Platform"),
        new GroupDef("PSM",         "Product Structure Management"),
        new GroupDef("APPLICATION", "Application"),
        new GroupDef("HELP",        "Help")
    );

    private final SettingsSectionRegistry registry;
    private final PnoApiClient pnoApiClient;

    /**
     * Returns grouped settings sections filtered by user permissions.
     * <p>
     * Filtering logic:
     * <ul>
     *   <li>Admin users see all sections</li>
     *   <li>Sections with no permission requirement are visible to everyone</li>
     *   <li>Sections with a GLOBAL permission are visible if the user's grants contain that permission</li>
     *   <li>If pno-api is unreachable, grants fall back to empty (degraded: admin-or-unrestricted only)</li>
     * </ul>
     */
    @GetMapping("/sections")
    public ResponseEntity<List<SettingsGroupDto>> getSections() {
        SettingsUserContext ctx = SettingsSecurityContext.get();
        boolean isAdmin = ctx.isAdmin();

        Set<String> grants = Optional.ofNullable(pnoApiClient.getUserContext(ctx.getUserId(), null))
            .map(SettingsUserContext::getGlobalPermissions)
            .orElse(Set.of());

        List<SettingSectionDto> allSections = registry.getAllSections();

        List<SettingSectionDto> visible = allSections.stream()
            .filter(s -> isAdmin || s.permission() == null || grants.contains(s.permission()))
            .toList();

        Map<String, List<SettingSectionDto>> byGroup = visible.stream()
            .collect(Collectors.groupingBy(
                s -> s.group() != null ? s.group() : "GENERAL"));

        // Known groups in declared order, then any custom group keys not in the static list
        // (key reused as label) so a service can publish under its own group name without
        // touching this aggregator.
        Set<String> known = GROUPS.stream().map(GroupDef::key).collect(Collectors.toSet());
        List<GroupDef> ordered = new ArrayList<>(GROUPS);
        byGroup.keySet().stream()
            .filter(k -> !known.contains(k))
            .sorted()
            .forEach(k -> ordered.add(new GroupDef(k, k)));

        List<SettingsGroupDto> result = ordered.stream()
            .filter(g -> byGroup.containsKey(g.key()))
            .map(g -> new SettingsGroupDto(
                g.key(),
                g.label(),
                byGroup.get(g.key()).stream()
                    .sorted(Comparator.comparingInt(SettingSectionDto::order))
                    .map(s -> new SettingsSectionResponse(
                        s.key(),
                        s.label(),
                        isAdmin || s.permission() == null || grants.contains(s.permission())))
                    .toList()))
            .filter(g -> !g.sections().isEmpty())
            .toList();

        return ResponseEntity.ok(result);
    }

    private record GroupDef(String key, String label) {}
}
