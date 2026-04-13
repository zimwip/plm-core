package com.pno;

import com.pno.domain.service.UserService;
import com.pno.domain.service.RoleService;
import com.pno.domain.service.ProjectSpaceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

/**
 * Smoke test — verifies Flyway migrations, seed data, and core service methods.
 * Runs against H2 in PostgreSQL compatibility mode.
 */
@SpringBootTest
class PnoSmokeTest {

    @Autowired UserService         userService;
    @Autowired RoleService         roleService;
    @Autowired ProjectSpaceService projectSpaceService;

    @Test
    void rolesAreSeedEd() {
        List<Map<String, Object>> roles = roleService.listRoles();
        assertThat(roles).hasSize(4);
        assertThat(roles).anyMatch(r -> "ADMIN".equals(r.get("name")) && Boolean.TRUE.equals(r.get("isAdmin")));
        assertThat(roles).anyMatch(r -> "DESIGNER".equals(r.get("name")));
    }

    @Test
    void userContextResolvesAliceInDefaultSpace() {
        Map<String, Object> ctx = userService.getUserContext("user-alice", "ps-default");
        assertThat(ctx).isNotNull();
        assertThat(ctx.get("username")).isEqualTo("alice");
        assertThat(ctx.get("isAdmin")).isEqualTo(false);
        assertThat((List<?>) ctx.get("roleIds")).containsExactly("role-designer");
    }

    @Test
    void userContextReturnsEmptyRolesForUnknownSpace() {
        Map<String, Object> ctx = userService.getUserContext("user-alice", "ps-nonexistent");
        assertThat(ctx).isNotNull();
        assertThat((List<?>) ctx.get("roleIds")).isEmpty();
    }

    @Test
    void userContextResolvesAllRolesWhenNoSpaceProvided() {
        Map<String, Object> ctx = userService.getUserContext("user-alice", null);
        assertThat(ctx).isNotNull();
        assertThat((List<?>) ctx.get("roleIds")).containsExactly("role-designer");
    }

    @Test
    void userContextResolvesAdmin() {
        Map<String, Object> ctx = userService.getUserContext("user-admin", "ps-default");
        assertThat(ctx).isNotNull();
        assertThat(ctx.get("isAdmin")).isEqualTo(true);
    }

    @Test
    void projectSpacesHaveDefault() {
        List<Map<String, Object>> spaces = projectSpaceService.listProjectSpaces();
        assertThat(spaces).hasSize(1);
        assertThat(spaces).anyMatch(s -> "ps-default".equals(s.get("id")));
    }

    @Test
    void unknownUserContextReturnsNull() {
        Map<String, Object> ctx = userService.getUserContext("user-nobody", "ps-default");
        assertThat(ctx).isNull();
    }

    @Test
    void userRolesIncludeProjectSpaceInfo() {
        List<Map<String, Object>> roles = userService.getUserRoles("user-alice", null);
        assertThat(roles).hasSize(1);
        Map<String, Object> assignment = roles.get(0);
        assertThat(assignment.get("id")).isEqualTo("role-designer");
        assertThat(assignment.get("projectSpaceId")).isEqualTo("ps-default");
    }
}
