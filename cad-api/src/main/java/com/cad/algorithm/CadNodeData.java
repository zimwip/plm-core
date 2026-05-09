package com.cad.algorithm;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public record CadNodeData(
        @JsonProperty("id")       String cadId,
        @JsonProperty("name")     String name,
        @JsonProperty("type")     String cadType,
        @JsonProperty("attributes") Map<String, String> attributes,
        @JsonProperty("parentId") String parentCadId,
        @JsonProperty("depth")    int depth
) {}
