package com.cad.algorithm;

import com.plm.platform.algorithm.AlgorithmBean;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@AlgorithmBean(code = "default", name = "Default Import Context",
        description = "Creates a PSM node for each CAD node using cadType as nodeTypeId")
public class DefaultImportContextAlgorithm implements ImportContextAlgorithm {

    @Override
    public ImportDecision evaluate(CadNodeData node, ImportJobContext ctx) {
        Map<String, String> attrs = new HashMap<>(node.attributes());
        attrs.put("name", node.name());
        String nodeTypeId = "nt-" + node.cadType().toLowerCase();
        // Derive a P-XXXXXX logical ID from the CAD node ID (pattern required by nt-part/nt-assembly)
        int hash = (Objects.hash(node.cadId(), node.cadType()) >>> 1) % 1000000;
        String logicalId = String.format("P-%06d", hash);
        return ImportDecision.create(nodeTypeId, logicalId, attrs);
    }
}
