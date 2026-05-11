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
        String type = node.cadType().toLowerCase();
        if (!"part".equals(type) && !"assembly".equals(type)) {
            return ImportDecision.skip();
        }

        String partNumber  = node.attributes().getOrDefault("partNumber", "");
        String description = node.attributes().getOrDefault("description", "");

        Map<String, String> attrs = new HashMap<>();
        attrs.put("ad-part-name", partNumber.isBlank() ? node.name() : partNumber);
        if (!description.isBlank()) attrs.put("ad-part-desc", description);

        String nodeTypeId = "nt-" + type;
        String logicalId = String.format("P-%06d",
                (Objects.hash(node.cadId(), node.cadType()) >>> 1) % 1_000_000);
        return ImportDecision.create(nodeTypeId, logicalId, attrs);
    }
}
