package com.cad.algorithm;

import com.plm.platform.algorithm.AlgorithmType;

@AlgorithmType(id = "algtype-import-context", name = "Import Context",
        description = "Decides PSM action for each CAD node during import")
public interface ImportContextAlgorithm {
    ImportDecision evaluate(CadNodeData node, ImportJobContext ctx);

    default ImportLinkDecision evaluateLink(CadNodeData child, CadOccurrence occurrence, ImportJobContext ctx) {
        double[] m = occurrence.positionMatrix();
        return (m != null && m.length == 16)
                ? ImportLinkDecision.composedOf(m)
                : ImportLinkDecision.composedOf();
    }
}
