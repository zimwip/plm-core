package com.plm.cad;

import com.plm.platform.algorithm.AlgorithmType;

@AlgorithmType(
    id = "algtype-node-import-validation",
    name = "Node Import Validation",
    description = "Validates and enriches CAD nodes before PSM import"
)
public interface NodeImportValidationAlgorithm {

    NodeValidationResult validate(NodeImportCandidate candidate);
}
