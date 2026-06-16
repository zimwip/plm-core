package com.dav.webdav;

import com.dav.security.DavSecurityContext;
import com.dav.security.DavUserContext;
import com.plm.platform.client.ServiceClient;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.NodeTypeConfig;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DavTreeServiceTest {

    private static final String DIR_TYPE = "nt-folder";
    private static final String FILE_LT = "lt-representation";

    private ServiceClient serviceClient;
    private ConfigCache configCache;
    private DavTreeService tree;

    @BeforeEach
    void setUp() {
        serviceClient = mock(ServiceClient.class);
        configCache = mock(ConfigCache.class);
        tree = new DavTreeService(serviceClient, configCache);

        DavSecurityContext.set(new DavUserContext("user-alice", "alice", Set.of(), false, null));

        when(configCache.getEntityMetadata()).thenReturn(Map.of(
            "NODE_TYPE:" + DIR_TYPE + ":webdav.directory", "true",
            "LINK_TYPE:" + FILE_LT + ":webdav.file", "true",
            "LIFECYCLE_STATE:state-x:frozen", "true"));
        when(configCache.getNodeType(DIR_TYPE)).thenReturn(Optional.of(new NodeTypeConfig(
            DIR_TYPE, "Folder", null, null, null, null, null, null, false, null, null,
            null, List.of(), List.of(), List.of())));
    }

    @AfterEach
    void tearDown() {
        DavSecurityContext.clear();
    }

    @Test
    void rootListsProjectSpaces() {
        when(serviceClient.get(eq("pno"), eq("/project-spaces?userId=user-alice"),
            any(ParameterizedTypeReference.class)))
            .thenReturn(List.of(Map.of("id", "ps-1", "name", "Default Space")));

        List<DavTreeService.Resource> spaces = tree.children(new DavTreeService.Root());

        assertEquals(1, spaces.size());
        DavTreeService.SpaceDir sd = assertInstanceOf(DavTreeService.SpaceDir.class, spaces.get(0));
        assertEquals("Default Space", sd.name());
        assertEquals("ps-1", sd.spaceId());
    }

    @Test
    void nodeChildrenClassifiesDirectoriesAndFiles() {
        // child links of the directory node: one sub-folder, one leaf node
        when(serviceClient.get(eq("psm"), eq("/nodes/n-root/links/children"),
            any(ParameterizedTypeReference.class)))
            .thenReturn(List.of(
                Map.of("targetSourceCode", "SELF", "linkTypeId", "lt-bom",
                    "targetType", DIR_TYPE, "targetNodeType", "Folder",
                    "targetNodeId", "n-sub", "targetLogicalId", "SUB-1"),
                Map.of("targetSourceCode", "SELF", "linkTypeId", "lt-bom",
                    "targetType", "nt-doc", "targetNodeType", "Document",
                    "targetNodeId", "n-doc", "targetLogicalId", "DOC-1")));
        // leaf node carries a webdav.file link to dst
        when(serviceClient.get(eq("psm"), eq("/nodes/n-doc/links/children"),
            any(ParameterizedTypeReference.class)))
            .thenReturn(List.of(
                Map.of("targetSourceCode", "data_resolver", "linkTypeId", FILE_LT,
                    "targetKey", "data-42", "displayKey", "spec.pdf",
                    "targetDetails", Map.of("sizeBytes", 48211, "contentType", "application/pdf"))));

        List<DavTreeService.Resource> children =
            tree.children(new DavTreeService.NodeDir("n-root", "ROOT-1", null));

        assertEquals(2, children.size());
        DavTreeService.NodeDir sub = assertInstanceOf(DavTreeService.NodeDir.class, children.get(0));
        assertEquals("SUB-1", sub.name());
        assertTrue(sub.collection());

        DavTreeService.FileEntry file = assertInstanceOf(DavTreeService.FileEntry.class, children.get(1));
        assertEquals("spec.pdf", file.name());
        assertEquals("data-42", file.dataId());
        assertEquals(48211L, file.sizeBytes());
        assertEquals("application/pdf", file.contentType());
    }

    @Test
    void leafWithoutFileLinkIsOmitted() {
        when(serviceClient.get(eq("psm"), eq("/nodes/n-root/links/children"),
            any(ParameterizedTypeReference.class)))
            .thenReturn(List.of(
                Map.of("targetSourceCode", "SELF", "linkTypeId", "lt-bom",
                    "targetType", "nt-doc", "targetNodeType", "Document",
                    "targetNodeId", "n-bare", "targetLogicalId", "BARE-1")));
        when(serviceClient.get(eq("psm"), eq("/nodes/n-bare/links/children"),
            any(ParameterizedTypeReference.class)))
            .thenReturn(List.of());

        List<DavTreeService.Resource> children =
            tree.children(new DavTreeService.NodeDir("n-root", "ROOT-1", null));

        assertTrue(children.isEmpty());
    }
}
