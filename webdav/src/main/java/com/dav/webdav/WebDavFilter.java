package com.dav.webdav;

import com.dav.webdav.DavTreeService.FileEntry;
import com.dav.webdav.DavTreeService.NodeDir;
import com.dav.webdav.DavTreeService.Resource;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * WebDAV protocol entry point. A servlet filter (not a controller) because
 * Spring MVC cannot map the PROPFIND method. Read-only: OPTIONS, PROPFIND
 * (Depth 0/1), GET, HEAD. Write verbs get 405.
 *
 * <p>Runs after PlmAuthFilter (which validated the forward JWT and captured it
 * in ServiceClientTokenContext); DavTreeService sets the project space there
 * from the first path segment.
 */
@Slf4j
@RequiredArgsConstructor
public class WebDavFilter implements Filter {

    private static final Set<String> PASS_THROUGH_PREFIXES =
        Set.of("/actuator", "/v3", "/swagger-ui", "/internal", "/error");
    private static final Set<String> WRITE_METHODS =
        Set.of("PUT", "POST", "DELETE", "MKCOL", "COPY", "MOVE", "PROPPATCH", "LOCK", "UNLOCK");
    private static final String ALLOW = "OPTIONS, PROPFIND, GET, HEAD";

    private final DavTreeService tree;
    private final DstStreamClient streamClient;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        String contextPath = req.getContextPath();
        String uri = req.getRequestURI();
        String path = (contextPath != null && !contextPath.isEmpty() && uri.startsWith(contextPath))
            ? uri.substring(contextPath.length()) : uri;

        if (PASS_THROUGH_PREFIXES.stream().anyMatch(path::startsWith)) {
            chain.doFilter(request, response);
            return;
        }

        String method = req.getMethod();
        switch (method) {
            case "OPTIONS" -> handleOptions(resp);
            case "PROPFIND" -> handlePropfind(req, resp, segments(path));
            case "GET", "HEAD" -> handleGet(resp, segments(path), "HEAD".equals(method));
            default -> {
                if (WRITE_METHODS.contains(method)) {
                    resp.setHeader("Allow", ALLOW);
                    resp.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED, "Read-only WebDAV");
                } else {
                    chain.doFilter(request, response);
                }
            }
        }
    }

    private void handleOptions(HttpServletResponse resp) {
        resp.setStatus(HttpServletResponse.SC_OK);
        resp.setHeader("DAV", "1");
        resp.setHeader("Allow", ALLOW);
        resp.setHeader("MS-Author-Via", "DAV");
    }

    private void handlePropfind(HttpServletRequest req, HttpServletResponse resp, List<String> segments)
            throws IOException {
        String depthHeader = req.getHeader("Depth");
        // RFC default is infinity, which we refuse (RFC 4918 allows 403 here).
        if (depthHeader == null || "infinity".equalsIgnoreCase(depthHeader)) {
            resp.sendError(HttpServletResponse.SC_FORBIDDEN, "Depth: infinity not supported");
            return;
        }
        int depth = "1".equals(depthHeader.trim()) ? 1 : 0;

        Optional<Resource> resolved = tree.resolve(segments);
        if (resolved.isEmpty()) {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        Resource resource = resolved.get();

        List<MultiStatusWriter.Entry> entries = new ArrayList<>();
        entries.add(entryFor(resource, req.getContextPath(), segments));
        if (depth == 1 && resource.collection()) {
            for (Resource child : tree.children(resource)) {
                List<String> childSegments = new ArrayList<>(segments);
                childSegments.add(child.name());
                entries.add(entryFor(child, req.getContextPath(), childSegments));
            }
        }

        resp.setStatus(207);
        resp.setContentType("application/xml; charset=utf-8");
        resp.getWriter().write(MultiStatusWriter.write(entries));
    }

    private void handleGet(HttpServletResponse resp, List<String> segments, boolean headOnly)
            throws IOException {
        Optional<Resource> resolved = tree.resolve(segments);
        if (resolved.isEmpty()) {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        Resource resource = resolved.get();
        if (resource.collection()) {
            // Browsers GET collections; WebDAV clients use PROPFIND.
            resp.setStatus(HttpServletResponse.SC_OK);
            resp.setContentType("text/plain; charset=utf-8");
            if (!headOnly) {
                resp.getWriter().write(resource.name() + "/ (WebDAV collection — use PROPFIND)");
            }
            return;
        }
        FileEntry file = (FileEntry) resource;
        if (headOnly) {
            resp.setStatus(HttpServletResponse.SC_OK);
            if (file.contentType() != null) resp.setContentType(file.contentType());
            if (file.sizeBytes() != null) resp.setContentLengthLong(file.sizeBytes());
            return;
        }
        streamClient.stream(file.dataId(), resp);
    }

    private MultiStatusWriter.Entry entryFor(Resource resource, String contextPath, List<String> segments) {
        Long size = null;
        String contentType = null;
        String lastModified = null;
        if (resource instanceof FileEntry f) {
            size = f.sizeBytes();
            contentType = f.contentType();
        } else if (resource instanceof NodeDir d) {
            lastModified = toHttpDate(d.createdAt());
        }
        String name = segments.isEmpty() ? "/" : resource.name();
        return new MultiStatusWriter.Entry(
            MultiStatusWriter.href(contextPath, segments, resource.collection()),
            name, resource.collection(), size, contentType, lastModified);
    }

    // created_at is an ISO LocalDateTime (no zone) — rendered as UTC.
    private static String toHttpDate(String isoLocalDateTime) {
        if (isoLocalDateTime == null || isoLocalDateTime.isBlank()) return null;
        try {
            return LocalDateTime.parse(isoLocalDateTime)
                .atOffset(ZoneOffset.UTC)
                .format(DateTimeFormatter.RFC_1123_DATE_TIME);
        } catch (RuntimeException e) {
            return null;
        }
    }

    private static List<String> segments(String path) {
        List<String> out = new ArrayList<>();
        for (String raw : path.split("/")) {
            if (raw.isBlank()) continue;
            out.add(UriUtils.decode(raw, StandardCharsets.UTF_8));
        }
        return out;
    }
}
