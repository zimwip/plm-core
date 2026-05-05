package com.plm.platform.item;

import com.plm.platform.item.dto.CreateAction;
import com.plm.platform.item.dto.GetAction;
import com.plm.platform.item.dto.ItemDescriptor;
import com.plm.platform.item.dto.ItemVisibilityContext;
import com.plm.platform.item.dto.ListAction;
import com.plm.platform.item.dto.ListItemShape;
import com.plm.platform.item.dto.PanelSection;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ItemVisibilityControllerTest {

    private static ItemDescriptor full(String code) {
        return new ItemDescriptor(
            "psm", "node", code,
            "Type " + code, null, null, null, "PLM",
            PanelSection.MAIN, 100,
            new CreateAction("POST", "/c", "application/json", "WRAPPED", List.of(), "Create", null, "PRIMARY", 0),
            new ListAction("GET", "/l", "page", "size", List.of(), new ListItemShape("id", "name", null), "Browse", null, "SECONDARY", 10),
            new GetAction("GET", "/g/{id}/detail", "Open", null, "SECONDARY", 20)
        );
    }

    private static ItemVisibilityContext nonAdmin() {
        return new ItemVisibilityContext("u", null, false, Set.of(), Set.of());
    }

    @Test
    void resolverNullingCreate_keepsListAndGet() {
        var d = full("Document");
        ItemVisibilityResolver r = (ctx, x) -> new ItemDescriptor(
            x.serviceCode(), x.itemCode(), x.itemKey(), x.displayName(), x.description(),
            x.icon(), x.color(), x.sourceLabel(), x.panelSection(), x.priority(),
            null, x.list(), x.get()
        );
        var c = new ItemVisibilityController(List.of(() -> List.of(d)), r);

        var body = c.visible(nonAdmin()).getBody();
        assertNotNull(body);
        assertEquals(1, body.size());
        assertNull(body.get(0).create());
        assertNotNull(body.get(0).list());
        assertNotNull(body.get(0).get());
    }

    @Test
    void resolverReturningNull_dropsDescriptor() {
        var d = full("Document");
        ItemVisibilityResolver r = (ctx, x) -> null;
        var c = new ItemVisibilityController(List.of(() -> List.of(d)), r);

        var body = c.visible(nonAdmin()).getBody();
        assertNotNull(body);
        assertTrue(body.isEmpty());
    }

    @Test
    void resolverNullingAllActions_dropsDescriptor() {
        var d = full("Document");
        ItemVisibilityResolver r = (ctx, x) -> new ItemDescriptor(
            x.serviceCode(), x.itemCode(), x.itemKey(), x.displayName(), x.description(),
            x.icon(), x.color(), x.sourceLabel(), x.panelSection(), x.priority(),
            null, null, null
        );
        var c = new ItemVisibilityController(List.of(() -> List.of(d)), r);

        var body = c.visible(nonAdmin()).getBody();
        assertNotNull(body);
        assertTrue(body.isEmpty());
    }

    @Test
    void admin_skipsResolver() {
        var d1 = full("Document");
        var d2 = full("Part");
        ItemVisibilityResolver r = (ctx, x) -> {
            throw new AssertionError("resolver must not run for admin");
        };
        var c = new ItemVisibilityController(List.of(() -> List.of(d1, d2)), r);

        var admin = new ItemVisibilityContext("admin", null, true, Set.of(), Set.of());
        var body = c.visible(admin).getBody();
        assertNotNull(body);
        assertEquals(2, body.size());
        assertSame(d1, body.get(0));
        assertSame(d2, body.get(1));
    }

    @Test
    void multipleContributions_aggregated() {
        var d1 = full("Document");
        var d2 = full("Part");
        ItemVisibilityResolver r = new DefaultItemVisibilityResolver();
        var c = new ItemVisibilityController(
            List.of(() -> List.of(d1), () -> List.of(d2)), r);

        var body = c.visible(nonAdmin()).getBody();
        assertNotNull(body);
        assertEquals(2, body.size());
    }
}
