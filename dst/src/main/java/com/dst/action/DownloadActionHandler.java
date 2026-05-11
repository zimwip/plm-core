package com.dst.action;

import com.dst.domain.DataMetadata;
import com.dst.domain.DataService;
import com.dst.security.DstSecurityContext;
import com.dst.security.DstUserContext;
import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import com.plm.platform.action.ActionRouteDescriptor;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

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
        return Optional.of(ActionRouteDescriptor.get("/data/{id}"));
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        throw new UnsupportedOperationException("Use GET /api/dst/data/{id}");
    }

    @Override
    public ResponseEntity<?> executeHttp(ActionContext ctx, Map<String, String> params, HttpServletRequest req) {
        DstUserContext dstCtx = DstSecurityContext.get();
        DataMetadata meta = dataService.download(ctx.nodeId(), dstCtx.getUserId(), dstCtx.getProjectSpaceId());

        HttpHeaders headers = new HttpHeaders();
        if (meta.originalName() != null && !meta.originalName().isBlank()) {
            headers.setContentDisposition(ContentDisposition.attachment()
                .filename(meta.originalName(), StandardCharsets.UTF_8).build());
        }
        headers.setContentLength(meta.sizeBytes());
        headers.add("X-Data-Sha256", meta.sha256());

        MediaType type = meta.contentType() != null
            ? MediaType.parseMediaType(meta.contentType())
            : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok().headers(headers).contentType(type)
            .body(new InputStreamResource(dataService.openStream(meta.location())));
    }
}
