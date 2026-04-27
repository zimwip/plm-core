package com.plm.permission.internal;

import com.plm.platform.authz.AuthzContext;
import com.plm.platform.authz.ScopeKeyResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Resolves the {@code nodeType} key for {@code NODE}-scoped (and
 * {@code LIFECYCLE}-scoped, via parent inheritance) permission checks. The
 * annotation at the call site may supply {@code nodeType} directly, a
 * {@code nodeId}, or a {@code linkId}; this resolver maps everything to
 * {@code nodeType}.
 *
 * <p>Why a resolver and not SpEL? Because {@code nodeId → nodeType} requires a
 * DB lookup in the scope of the current user's transaction, which can't be
 * expressed in the annotation expression.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NodeScopeKeyResolver implements ScopeKeyResolver {

    private final DSLContext dsl;

    @Override
    public String scopeCode() {
        return "NODE";
    }

    @Override
    public Map<String, String> resolveKeys(ProceedingJoinPoint pjp,
                                           Map<String, String> rawKeys,
                                           AuthzContext ctx) {
        Map<String, String> out = new LinkedHashMap<>(rawKeys);

        String nodeType = out.get("nodeType");
        if (nodeType == null || nodeType.isBlank()) return out;

        // Heuristic: nodeType values in the seed all start with "nt-". Anything
        // else is treated as either a nodeId or a linkId that we must translate.
        if (nodeType.startsWith("nt-")) return out;

        String resolved = resolveFromNodeId(nodeType, ctx.userId());
        if (resolved == null) {
            resolved = resolveFromLinkId(nodeType, ctx.userId());
        }
        if (resolved != null) {
            out.put("nodeType", resolved);
        } else {
            log.debug("NodeScopeKeyResolver: unable to resolve nodeType from '{}'", nodeType);
        }
        return out;
    }

    private String resolveFromNodeId(String nodeId, String userId) {
        return dsl.select(DSL.field("n.node_type_id").as("node_type_id"))
            .from("node n")
            .join("node_version nv").on("nv.node_id = n.id")
            .join("plm_transaction pt").on("pt.id = nv.tx_id")
            .where("n.id = ?", nodeId)
            .and("(pt.status = 'COMMITTED' OR pt.owner_id = ?)", userId)
            .orderBy(DSL.field("nv.version_number").desc())
            .limit(1)
            .fetchOne(DSL.field("node_type_id"), String.class);
    }

    private String resolveFromLinkId(String linkId, String userId) {
        String sourceNodeId = dsl.select(DSL.field("nv.node_id").as("node_id"))
            .from("node_version_link nvl")
            .join("node_version nv").on("nv.id = nvl.source_node_version_id")
            .where("nvl.id = ?", linkId)
            .limit(1)
            .fetchOne(DSL.field("node_id"), String.class);
        if (sourceNodeId == null) return null;
        return resolveFromNodeId(sourceNodeId, userId);
    }
}
