package com.dav.webdav;

import com.dav.security.DavSecurityContext;
import com.dav.security.DavUserContext;
import com.plm.platform.client.ServiceClient;
import com.plm.platform.client.ServiceClientTokenContext;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.NodeTypeConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

/**
 * Maps the PSM graph onto a WebDAV tree:
 * <pre>
 *   /                      → one collection per project space (pno)
 *   /&lt;space&gt;/              → root directory-nodes (no parent link) of the space
 *   /&lt;space&gt;/&lt;dir&gt;/...     → node whose type has metadata webdav.directory=true
 *   .../&lt;file&gt;             → child node carrying a link whose link_type has
 *                            metadata webdav.file=true → rendered as the DST file
 * </pre>
 * Metamodel flags come from the psm-admin config snapshot entity metadata
 * ({@code NODE_TYPE:<id>:webdav.directory}, {@code LINK_TYPE:<id>:webdav.file}).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DavTreeService {

    private static final String SELF = "SELF";

    private final ServiceClient serviceClient;
    private final ConfigCache configCache;

    // ── Resource model ───────────────────────────────────────────────

    public sealed interface Resource permits Root, SpaceDir, NodeDir, FileEntry {
        String name();
        default boolean collection() { return !(this instanceof FileEntry); }
    }

    public record Root() implements Resource {
        @Override public String name() { return ""; }
    }

    public record SpaceDir(String spaceId, String name) implements Resource {}

    public record NodeDir(String nodeId, String name, String createdAt) implements Resource {}

    public record FileEntry(String dataId, String name, Long sizeBytes, String contentType) implements Resource {}

    // ── Path resolution ──────────────────────────────────────────────

    /**
     * Walks decoded path segments from the root. Sets the project-space
     * ThreadLocal (picked up by ServiceClient) as soon as the space segment
     * is resolved, so downstream psm/dst calls are scoped correctly.
     */
    public Optional<Resource> resolve(List<String> segments) {
        Resource current = new Root();
        for (String segment : segments) {
            Resource next = null;
            for (Resource child : children(current)) {
                if (child.name().equals(segment)) {
                    next = child;
                    break;
                }
            }
            if (next == null) return Optional.empty();
            if (next instanceof SpaceDir sd) {
                ServiceClientTokenContext.setProjectSpace(sd.spaceId());
            }
            current = next;
        }
        return Optional.of(current);
    }

    // ── Listing ──────────────────────────────────────────────────────

    public List<Resource> children(Resource resource) {
        if (resource instanceof Root)         return listSpaces();
        if (resource instanceof SpaceDir)     return listSpaceRoots();
        if (resource instanceof NodeDir dir)  return listNodeChildren(dir.nodeId());
        return List.of();
    }

    private List<Resource> listSpaces() {
        DavUserContext ctx = DavSecurityContext.get();
        List<Map<String, Object>> spaces = serviceClient.get("pno",
            "/api/pno/project-spaces?userId=" + ctx.getUserId(),
            new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        if (spaces == null) return List.of();
        return spaces.stream()
            .map(s -> (Resource) new SpaceDir(
                Objects.toString(s.get("id"), null),
                Objects.toString(s.get("name"), null)))
            .filter(s -> s.name() != null && !s.name().isBlank())
            .toList();
    }

    private List<Resource> listSpaceRoots() {
        List<Resource> out = new ArrayList<>();
        for (String typeId : directoryNodeTypeIds()) {
            Map<String, Object> page = serviceClient.get("psm",
                "/api/psm/nodes?type=" + typeId + "&rootsOnly=true&page=0&size=500",
                new ParameterizedTypeReference<Map<String, Object>>() {});
            if (page == null) continue;
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) page.getOrDefault("items", List.of());
            for (Map<String, Object> n : items) {
                String name = Objects.toString(n.get("logical_id"), null);
                if (name == null || name.isBlank()) continue;
                out.add(new NodeDir(
                    Objects.toString(n.get("id"), null),
                    name,
                    Objects.toString(n.get("created_at"), null)));
            }
        }
        return out;
    }

    private List<Resource> listNodeChildren(String nodeId) {
        Set<String> dirTypeIds = directoryNodeTypeIds();
        Set<String> dirTypeNames = directoryNodeTypeNames(dirTypeIds);
        Set<String> fileLinkTypeIds = fileLinkTypeIds();

        List<Resource> out = new ArrayList<>();
        for (Map<String, Object> link : childLinks(nodeId)) {
            String sourceCode = Objects.toString(link.get("targetSourceCode"), "");
            String linkTypeId = Objects.toString(link.get("linkTypeId"), "");
            if (SELF.equals(sourceCode)) {
                String targetType = Objects.toString(link.get("targetType"), "");
                String targetNodeType = Objects.toString(link.get("targetNodeType"), "");
                String targetNodeId = Objects.toString(link.get("targetNodeId"), null);
                if (targetNodeId == null) continue;
                if (dirTypeIds.contains(targetType) || dirTypeNames.contains(targetNodeType)) {
                    out.add(new NodeDir(targetNodeId,
                        Objects.toString(link.get("targetLogicalId"), targetNodeId), null));
                } else {
                    // Leaf node: rendered as its file representation, if any.
                    fileEntryOf(targetNodeId, fileLinkTypeIds).ifPresent(out::add);
                }
            } else if (fileLinkTypeIds.contains(linkTypeId)) {
                fileEntryFromLink(link).ifPresent(out::add);
            }
        }
        return out;
    }

    /** First webdav.file link of the node, rendered as the linked DST file. */
    private Optional<Resource> fileEntryOf(String nodeId, Set<String> fileLinkTypeIds) {
        for (Map<String, Object> link : childLinks(nodeId)) {
            String sourceCode = Objects.toString(link.get("targetSourceCode"), "");
            String linkTypeId = Objects.toString(link.get("linkTypeId"), "");
            if (!SELF.equals(sourceCode) && fileLinkTypeIds.contains(linkTypeId)) {
                return fileEntryFromLink(link);
            }
        }
        return Optional.empty();
    }

    private Optional<Resource> fileEntryFromLink(Map<String, Object> link) {
        String dataId = Objects.toString(link.get("targetKey"), null);
        if (dataId == null) return Optional.empty();
        String name = Objects.toString(link.get("displayKey"), dataId);
        Long size = null;
        String contentType = null;
        if (link.get("targetDetails") instanceof Map<?, ?> details) {
            Object sz = details.get("sizeBytes");
            if (sz instanceof Number n) size = n.longValue();
            contentType = Objects.toString(details.get("contentType"), null);
        }
        return Optional.of(new FileEntry(dataId, name, size, contentType));
    }

    private List<Map<String, Object>> childLinks(String nodeId) {
        List<Map<String, Object>> links = serviceClient.get("psm",
            "/api/psm/nodes/" + nodeId + "/links/children",
            new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        return links != null ? links : List.of();
    }

    // ── Metamodel flags (config snapshot entity metadata) ────────────

    private Set<String> directoryNodeTypeIds() {
        return metadataFlaggedIds("NODE_TYPE", "webdav.directory");
    }

    private Set<String> fileLinkTypeIds() {
        return metadataFlaggedIds("LINK_TYPE", "webdav.file");
    }

    // getChildLinks exposes the target node type by NAME (not id), so match both.
    private Set<String> directoryNodeTypeNames(Set<String> dirTypeIds) {
        Set<String> names = new HashSet<>();
        for (String id : dirTypeIds) {
            configCache.getNodeType(id).map(NodeTypeConfig::name).ifPresent(names::add);
        }
        return names;
    }

    private Set<String> metadataFlaggedIds(String targetType, String metaKey) {
        Set<String> ids = new HashSet<>();
        String prefix = targetType + ":";
        String suffix = ":" + metaKey;
        configCache.getEntityMetadata().forEach((key, value) -> {
            if (key.startsWith(prefix) && key.endsWith(suffix) && Boolean.parseBoolean(value)) {
                ids.add(key.substring(prefix.length(), key.length() - suffix.length()));
            }
        });
        return ids;
    }
}
