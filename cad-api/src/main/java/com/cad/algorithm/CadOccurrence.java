package com.cad.algorithm;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CadOccurrence(
        @JsonProperty("parentId")       String parentCadId,
        @JsonProperty("positionMatrix") double[] positionMatrix
) {}
