package com.pno.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BasketService {

    private final DSLContext dsl;

    public List<Map<String, Object>> list(String userId, String psId) {
        return dsl.fetch(
            "SELECT source, type_code, item_id FROM basket_item WHERE user_id = ? AND ps_id = ? ORDER BY created_at",
            userId, psId
        ).stream().map(r -> Map.<String, Object>of(
            "source",   r.get("source",    String.class),
            "typeCode", r.get("type_code", String.class),
            "itemId",   r.get("item_id",   String.class)
        )).collect(Collectors.toList());
    }

    /** Returns true if a new row was inserted (false = already present). */
    public boolean add(String userId, String psId, String source, String typeCode, String itemId) {
        int rows = dsl.execute(
            "INSERT INTO basket_item (id, user_id, ps_id, source, type_code, item_id)" +
            " VALUES (?, ?, ?, ?, ?, ?)" +
            " ON CONFLICT (user_id, ps_id, source, type_code, item_id) DO NOTHING",
            UUID.randomUUID().toString(), userId, psId, source, typeCode, itemId
        );
        return rows > 0;
    }

    public void remove(String userId, String psId, String source, String typeCode, String itemId) {
        dsl.execute(
            "DELETE FROM basket_item WHERE user_id = ? AND ps_id = ? AND source = ? AND type_code = ? AND item_id = ?",
            userId, psId, source, typeCode, itemId
        );
    }

    public void clear(String userId, String psId) {
        dsl.execute("DELETE FROM basket_item WHERE user_id = ? AND ps_id = ?", userId, psId);
    }

    /** Remove specific item IDs across all source/type entries (used after rollback). */
    public void removeItemIds(String userId, String psId, List<String> itemIds) {
        if (itemIds.isEmpty()) return;
        String placeholders = itemIds.stream().map(x -> "?").collect(Collectors.joining(", "));
        List<Object> params = new java.util.ArrayList<>();
        params.add(userId);
        params.add(psId);
        params.addAll(itemIds);
        dsl.execute(
            "DELETE FROM basket_item WHERE user_id = ? AND ps_id = ? AND item_id IN (" + placeholders + ")",
            params.toArray()
        );
    }
}
