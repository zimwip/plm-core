package com.dst.action;

import com.dst.domain.DataService;
import com.dst.domain.PresignedUrl;
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

/**
 * DOWNLOAD action — returns a time-limited presigned S3 URL so the browser
 * fetches the file straight from object storage instead of streaming it
 * through dst.
 */
@Component
@RequiredArgsConstructor
public class DownloadActionHandler implements ActionHandler {

    private final DataService dataService;

    @Override
    public String actionCode() {
        return "DOWNLOAD";
    }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.get("/data/{id}/download-url"));
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        throw new UnsupportedOperationException("Use GET /api/dst/data/{id}/download-url");
    }

    @Override
    public ResponseEntity<?> executeHttp(ActionContext ctx, Map<String, String> params, HttpServletRequest req) {
        DstUserContext dstCtx = DstSecurityContext.get();
        PresignedUrl presigned = dataService.presignedUrl(
            ctx.nodeId(), dstCtx.getUserId(), dstCtx.getProjectSpaceId());
        return ResponseEntity.ok(Map.of(
            "url", presigned.url(),
            "expiresInSeconds", presigned.expiresInSeconds(),
            "size", presigned.size()));
    }
}
