package com.plm.cad;

import com.plm.platform.algorithm.AlgorithmBean;

import java.util.HashMap;
import java.util.Map;

@AlgorithmBean(
    code = "default-node-validation",
    name = "Default Node Validation",
    description = "Accepts all nodes; maps cadType to nodeTypeId (lowercase)"
)
public class DefaultNodeImportValidationAlgorithm implements NodeImportValidationAlgorithm {

    @Override
    public NodeValidationResult validate(NodeImportCandidate candidate) {
        String typeId = candidate.cadType() != null
            ? candidate.cadType().toLowerCase()
            : "part";
        Map<String, String> attrs = new HashMap<>(candidate.attributes());
        if (candidate.name() != null) attrs.put("name", candidate.name());
        return NodeValidationResult.accept(typeId, attrs);
    }
}
