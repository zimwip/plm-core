package com.plm.node.source;

import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.platform.spe.client.ServiceClient;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardViolation;
import com.plm.source.KeyHint;
import com.plm.source.LinkConstraint;
import com.plm.source.Reference;
import com.plm.source.ResolvedTarget;
import com.plm.source.SourceResolver;
import com.plm.source.SourceResolverContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Source resolver that targets binary blobs hosted in the dst service.
 *
 * <ul>
 *   <li>{@code type} — convention: {@code "filetype"} (single supported type for v1)</li>
 *   <li>{@code key}  — the dst-minted UUID returned by the upload endpoint</li>
 * </ul>
 *
 * Resolution and validation walk through the spe gateway via {@link ServiceClient}
 * to {@code GET /api/dst/data/{id}/metadata}. The link itself is always already-pinned
 * (data objects are immutable once written) — the resolver returns {@code pinnedKey}
 * equal to the input key.
 */
@Slf4j
@AlgorithmBean(code = "data_resolver", name = "DST Data Resolver",
    description = "Resolves links to binary data objects hosted in the dst service")
@RequiredArgsConstructor
public class DataResolver implements SourceResolver {

    private static final String DST_SERVICE_CODE = "dst";
    private static final String FILETYPE = "filetype";

    private final ServiceClient serviceClient;

    @Override
    public String code() { return "data_resolver"; }

    @Override
    public List<String> supportedTypes() { return List.of(FILETYPE); }

    @Override
    public ResolvedTarget resolve(SourceResolverContext ctx) {
        Map<String, Object> meta = fetchMetadata(ctx.key());
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("sha256",       meta.get("sha256"));
        details.put("sizeBytes",    meta.get("sizeBytes"));
        details.put("contentType",  meta.get("contentType"));
        details.put("originalName", meta.get("originalName"));
        String display = (String) meta.getOrDefault("originalName", ctx.key());
        return new ResolvedTarget(display, FILETYPE, ctx.key(), details);
    }

    @Override
    public List<GuardViolation> validate(SourceResolverContext ctx, LinkConstraint constraint) {
        if (!FILETYPE.equals(ctx.type())) {
            return List.of(new GuardViolation("DST_WRONG_TYPE",
                "DataResolver only supports type 'filetype', got " + ctx.type(), GuardEffect.BLOCK));
        }
        try {
            fetchMetadata(ctx.key());
            return List.of();
        } catch (RuntimeException e) {
            return List.of(new GuardViolation("DST_TARGET_NOT_FOUND",
                "Data object " + ctx.key() + " not found in dst: " + e.getMessage(),
                GuardEffect.BLOCK));
        }
    }

    @Override
    public List<KeyHint> suggestKeys(String type, String query, int limit) {
        try {
            List<Map<String, Object>> files = serviceClient.get(
                DST_SERVICE_CODE,
                "/api/dst/data?size=" + limit,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            if (files == null) return List.of();
            String q = query != null ? query.toLowerCase() : "";
            return files.stream()
                .filter(f -> q.isEmpty() ||
                    Objects.toString(f.get("originalName"), "").toLowerCase().contains(q))
                .limit(limit)
                .map(f -> {
                    String key  = Objects.toString(f.get("id"), "");
                    String name = Objects.toString(f.get("originalName"), key);
                    String ct   = Objects.toString(f.get("contentType"), "");
                    long sz     = f.get("sizeBytes") instanceof Number n ? n.longValue() : 0L;
                    return new KeyHint(key, name, Map.of("contentType", ct, "sizeBytes", sz));
                })
                .toList();
        } catch (Exception e) {
            log.warn("suggestKeys: dst list failed: {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    public List<Reference> findReferencesTo(String type, String key) {
        // Nothing inside dst tracks reverse references; left intentionally empty.
        return List.of();
    }

    private Map<String, Object> fetchMetadata(String dataId) {
        Map<String, Object> meta = serviceClient.get(
            DST_SERVICE_CODE,
            "/api/dst/data/" + dataId + "/metadata",
            new ParameterizedTypeReference<Map<String, Object>>() {});
        if (meta == null) throw new IllegalArgumentException("Empty metadata response for " + dataId);
        return meta;
    }
}
