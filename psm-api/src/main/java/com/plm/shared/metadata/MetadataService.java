package com.plm.shared.metadata;

import com.plm.platform.config.ConfigCache;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Generic key/value metadata attached to any entity via target_type + target_id.
 *
 * Reads from ConfigCache (populated by psm-admin snapshots).
 * Entity metadata is stored in ConfigSnapshot as a flat map with composite keys:
 *   "TARGET_TYPE:targetId:metaKey" → "metaValue"
 */
@Slf4j
@Service
public class MetadataService {

    private final ConfigCache configCache;

    public MetadataService(ConfigCache configCache) {
        this.configCache = configCache;
    }

    /** Returns all metadata for a given target, or empty map. */
    public Map<String, String> getMetadata(String targetType, String targetId) {
        Map<String, String> allMeta = configCache.getEntityMetadata();
        String prefix = targetType + ":" + targetId + ":";
        Map<String, String> result = new HashMap<>();
        for (var entry : allMeta.entrySet()) {
            if (entry.getKey().startsWith(prefix)) {
                String metaKey = entry.getKey().substring(prefix.length());
                result.put(metaKey, entry.getValue());
            }
        }
        return result.isEmpty() ? Map.of() : Map.copyOf(result);
    }

    /** Returns a single metadata value, or null. */
    public String getValue(String targetType, String targetId, String metaKey) {
        String compositeKey = targetType + ":" + targetId + ":" + metaKey;
        return configCache.getEntityMetadata().get(compositeKey);
    }

    /** Returns true if the metadata key exists and equals "true". */
    public boolean isTrue(String targetType, String targetId, String metaKey) {
        return "true".equals(getValue(targetType, targetId, metaKey));
    }
}
