package com.dst.action;

import com.dst.domain.DataService;
import com.dst.security.DstSecurityContext;
import com.dst.security.DstUserContext;
import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import com.plm.platform.action.ActionRouteDescriptor;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DeleteActionHandler implements ActionHandler {

    private final DataService dataService;

    @Override
    public String actionCode() {
        return "DELETE";
    }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.delete("/api/dst/data/{id}"));
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        DstUserContext dstCtx = DstSecurityContext.get();
        dataService.delete(ctx.nodeId(), dstCtx.getUserId(), dstCtx.getProjectSpaceId());
        return ActionResult.ok(Map.of());
    }

    @Override
    public ResponseEntity<?> executeHttp(ActionContext ctx, Map<String, String> params, HttpServletRequest req) {
        execute(ctx, params);
        return ResponseEntity.noContent().build();
    }
}
