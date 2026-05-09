package com.cad.algorithm;

import com.plm.platform.algorithm.AlgorithmType;

@AlgorithmType(id = "algtype-import-context", name = "Import Context",
        description = "Decides PSM action for each CAD node during import")
public interface ImportContextAlgorithm {
    ImportDecision evaluate(CadNodeData node, ImportJobContext ctx);
}
