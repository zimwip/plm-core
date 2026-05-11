package com.cad.algorithm;

import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public record ImportLinkDecision(
        String linkTypeId,
        Map<String, String> attributes
) {
    public static ImportLinkDecision composedOf() {
        return new ImportLinkDecision("lt-composed-of", Map.of());
    }

    public static ImportLinkDecision composedOf(double[] matrix) {
        String serialized = IntStream.range(0, 16)
                .mapToObj(i -> String.valueOf(matrix[i]))
                .collect(Collectors.joining(","));
        return new ImportLinkDecision("lt-composed-of", Map.of("position", serialized));
    }
}
