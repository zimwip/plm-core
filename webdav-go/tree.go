package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	platformlib "github.com/plm/platform-lib-go"
)

const selfSource = "SELF"

// Resource is a node in the WebDAV tree.
type Resource interface {
	Name() string
	IsCollection() bool
}

type rootRes struct{}

func (rootRes) Name() string       { return "" }
func (rootRes) IsCollection() bool { return true }

type spaceDir struct {
	spaceID string
	name    string
}

func (s spaceDir) Name() string     { return s.name }
func (spaceDir) IsCollection() bool { return true }

type nodeDir struct {
	nodeID    string
	name      string
	createdAt string
}

func (n nodeDir) Name() string     { return n.name }
func (nodeDir) IsCollection() bool { return true }

type fileEntry struct {
	dataID      string
	name        string
	sizeBytes   *int64
	contentType string
}

func (f fileEntry) Name() string     { return f.name }
func (fileEntry) IsCollection() bool { return false }

// Tree maps the PSM graph onto a WebDAV tree (port of DavTreeService):
//
//	/                  → one collection per project space (pno)
//	/<space>/          → root directory-nodes of the space
//	/<space>/<dir>/... → node whose type has metadata webdav.directory=true
//	.../<file>         → child carrying a link whose link_type has webdav.file=true
type Tree struct {
	client *platformlib.ServiceClient
	config *platformlib.ConfigCache
}

func NewTree(client *platformlib.ServiceClient, config *platformlib.ConfigCache) *Tree {
	return &Tree{client: client, config: config}
}

// Resolve walks decoded path segments from the root. It sets the request
// project-space (on the bound *RequestContext) as soon as the space segment
// resolves, so downstream psm/dst calls are scoped correctly.
func (t *Tree) Resolve(ctx context.Context, segments []string) (Resource, bool) {
	var current Resource = rootRes{}
	for _, segment := range segments {
		var next Resource
		for _, child := range t.Children(ctx, current) {
			if child.Name() == segment {
				next = child
				break
			}
		}
		if next == nil {
			return nil, false
		}
		if sd, ok := next.(spaceDir); ok {
			if rc := platformlib.RequestContextFrom(ctx); rc != nil {
				rc.ProjectSpace = sd.spaceID
			}
		}
		current = next
	}
	return current, true
}

// Children lists the immediate children of a resource.
func (t *Tree) Children(ctx context.Context, resource Resource) []Resource {
	switch res := resource.(type) {
	case rootRes:
		return t.listSpaces(ctx)
	case spaceDir:
		return t.listSpaceRoots(ctx)
	case nodeDir:
		return t.listNodeChildren(ctx, res.nodeID)
	}
	return nil
}

func (t *Tree) listSpaces(ctx context.Context) []Resource {
	rc := platformlib.RequestContextFrom(ctx)
	userID := ""
	if rc != nil {
		userID = rc.UserID
	}
	var spaces []map[string]any
	if err := t.client.GetJSON(ctx, "pno", "/project-spaces?userId="+qesc(userID), &spaces); err != nil {
		log.Printf("listSpaces failed: %v", err)
		return nil
	}
	out := make([]Resource, 0, len(spaces))
	for _, s := range spaces {
		name := mstr(s, "name")
		if name == "" {
			continue
		}
		out = append(out, spaceDir{spaceID: mstr(s, "id"), name: name})
	}
	return out
}

func (t *Tree) listSpaceRoots(ctx context.Context) []Resource {
	out := []Resource{}
	for typeID := range t.directoryNodeTypeIDs() {
		var page map[string]any
		path := fmt.Sprintf("/nodes?type=%s&rootsOnly=true&page=0&size=500", qesc(typeID))
		if err := t.client.GetJSON(ctx, "psm", path, &page); err != nil {
			log.Printf("listSpaceRoots(%s) failed: %v", typeID, err)
			continue
		}
		for _, item := range asMaps(page["items"]) {
			name := mstr(item, "logical_id")
			if name == "" {
				continue
			}
			out = append(out, nodeDir{
				nodeID:    mstr(item, "id"),
				name:      name,
				createdAt: mstr(item, "created_at"),
			})
		}
	}
	return out
}

func (t *Tree) listNodeChildren(ctx context.Context, nodeID string) []Resource {
	dirTypeIDs := t.directoryNodeTypeIDs()
	dirTypeNames := t.directoryNodeTypeNames(dirTypeIDs)
	fileLinkTypeIDs := t.fileLinkTypeIDs()

	out := []Resource{}
	for _, link := range t.childLinks(ctx, nodeID) {
		sourceCode := mstr(link, "targetSourceCode")
		linkTypeID := mstr(link, "linkTypeId")
		if sourceCode == selfSource {
			targetType := mstr(link, "targetType")
			targetNodeType := mstr(link, "targetNodeType")
			targetNodeID := mstr(link, "targetNodeId")
			if targetNodeID == "" {
				continue
			}
			if dirTypeIDs[targetType] || dirTypeNames[targetNodeType] {
				name := mstr(link, "targetLogicalId")
				if name == "" {
					name = targetNodeID
				}
				out = append(out, nodeDir{nodeID: targetNodeID, name: name})
			} else if f, ok := t.fileEntryOf(ctx, targetNodeID, fileLinkTypeIDs); ok {
				out = append(out, f)
			}
		} else if fileLinkTypeIDs[linkTypeID] {
			if f, ok := fileEntryFromLink(link); ok {
				out = append(out, f)
			}
		}
	}
	return out
}

// fileEntryOf returns the first webdav.file link of a node as a DST file.
func (t *Tree) fileEntryOf(ctx context.Context, nodeID string, fileLinkTypeIDs map[string]bool) (fileEntry, bool) {
	for _, link := range t.childLinks(ctx, nodeID) {
		sourceCode := mstr(link, "targetSourceCode")
		linkTypeID := mstr(link, "linkTypeId")
		if sourceCode != selfSource && fileLinkTypeIDs[linkTypeID] {
			return fileEntryFromLink(link)
		}
	}
	return fileEntry{}, false
}

func fileEntryFromLink(link map[string]any) (fileEntry, bool) {
	dataID := mstr(link, "targetKey")
	if dataID == "" {
		return fileEntry{}, false
	}
	name := mstr(link, "displayKey")
	if name == "" {
		name = dataID
	}
	f := fileEntry{dataID: dataID, name: name}
	if details, ok := link["targetDetails"].(map[string]any); ok {
		if sz, ok := details["sizeBytes"].(float64); ok {
			n := int64(sz)
			f.sizeBytes = &n
		}
		f.contentType = mstr(details, "contentType")
	}
	return f, true
}

func (t *Tree) childLinks(ctx context.Context, nodeID string) []map[string]any {
	var links []map[string]any
	if err := t.client.GetJSON(ctx, "psm", "/nodes/"+qesc(nodeID)+"/links/children", &links); err != nil {
		log.Printf("childLinks(%s) failed: %v", nodeID, err)
		return nil
	}
	return links
}

// StreamFile proxies dst /data/{id}/content straight to the client (port of
// DstStreamClient). Presigned URLs are signed for the public endpoint and
// unusable as redirects here, so the bytes flow through.
func (t *Tree) StreamFile(ctx context.Context, dataID string, w http.ResponseWriter) {
	resp, err := t.client.StreamRaw(ctx, http.MethodGet, "dst", "/data/"+qesc(dataID)+"/content")
	if err != nil {
		if ue, ok := err.(*platformlib.UpstreamError); ok {
			http.Error(w, "", ue.Status)
		} else {
			http.Error(w, "upstream error", http.StatusBadGateway)
		}
		return
	}
	defer resp.Body.Close()
	if ct := resp.Header.Get("Content-Type"); ct != "" {
		w.Header().Set("Content-Type", ct)
	}
	if cl := resp.Header.Get("Content-Length"); cl != "" {
		w.Header().Set("Content-Length", cl)
	}
	w.WriteHeader(resp.StatusCode)
	if _, err := io.Copy(w, resp.Body); err != nil {
		log.Printf("stream %s interrupted: %v", dataID, err)
	}
}

// ── Metamodel flags (config snapshot entity metadata) ──────────────────────

func (t *Tree) directoryNodeTypeIDs() map[string]bool {
	return t.metadataFlaggedIDs("NODE_TYPE", "webdav.directory")
}

func (t *Tree) fileLinkTypeIDs() map[string]bool {
	return t.metadataFlaggedIDs("LINK_TYPE", "webdav.file")
}

// getChildLinks exposes the target node type by NAME (not id), so match both.
func (t *Tree) directoryNodeTypeNames(dirTypeIDs map[string]bool) map[string]bool {
	names := map[string]bool{}
	for id := range dirTypeIDs {
		if nt, ok := t.config.NodeType(id); ok && nt.Name != "" {
			names[nt.Name] = true
		}
	}
	return names
}

func (t *Tree) metadataFlaggedIDs(targetType, metaKey string) map[string]bool {
	ids := map[string]bool{}
	prefix := targetType + ":"
	suffix := ":" + metaKey
	for key, value := range t.config.EntityMetadata() {
		if len(key) > len(prefix)+len(suffix) &&
			strings.HasPrefix(key, prefix) && strings.HasSuffix(key, suffix) && value == "true" {
			ids[key[len(prefix):len(key)-len(suffix)]] = true
		}
	}
	return ids
}
