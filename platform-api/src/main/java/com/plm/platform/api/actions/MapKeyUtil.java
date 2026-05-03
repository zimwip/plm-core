package com.plm.platform.api.actions;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

final class MapKeyUtil {
    private MapKeyUtil() {}

    static List<Map<String, Object>> camelize(List<Map<String, Object>> rows) {
        return rows.stream().map(MapKeyUtil::camelize).collect(Collectors.toList());
    }

    static Map<String, Object> camelize(Map<String, Object> row) {
        Map<String, Object> out = new LinkedHashMap<>();
        for (Map.Entry<String, Object> e : row.entrySet()) {
            out.put(toCamel(e.getKey()), e.getValue());
        }
        return out;
    }

    private static String toCamel(String key) {
        if (key == null || key.isEmpty() || key.indexOf('_') < 0) return key;
        StringBuilder sb = new StringBuilder(key.length());
        boolean upper = false;
        for (int i = 0; i < key.length(); i++) {
            char c = key.charAt(i);
            if (c == '_') { upper = true; continue; }
            if (upper) { sb.append(Character.toUpperCase(c)); upper = false; }
            else sb.append(c);
        }
        return sb.toString();
    }
}
