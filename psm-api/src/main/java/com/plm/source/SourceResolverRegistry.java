package com.plm.source;

import com.plm.algorithm.AlgorithmRegistry;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.SourceConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Looks up the {@link SourceResolver} bound to a Source by walking
 * {@code Source → resolverInstance → algorithm → bean}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SourceResolverRegistry {

    private final ConfigCache configCache;
    private final ApplicationContext appCtx;

    /** Resolve by source id (e.g. "SELF"). */
    public SourceResolver getResolverFor(String sourceId) {
        SourceConfig src = configCache.getSource(sourceId)
            .orElseThrow(() -> new IllegalArgumentException("Unknown source: " + sourceId));
        String code = src.resolverAlgorithmCode();
        if (code == null || code.isBlank()) {
            throw new IllegalStateException("Source " + sourceId + " has no resolver algorithm code in snapshot");
        }
        return AlgorithmRegistry.getInstance(appCtx).resolve(code, SourceResolver.class);
    }

    /** All resolvers registered as algorithm beans (regardless of whether a Source binds them). */
    public List<SourceResolver> all() {
        return AlgorithmRegistry.getInstance(appCtx).getAllBeans().values().stream()
            .filter(SourceResolver.class::isInstance)
            .map(SourceResolver.class::cast)
            .toList();
    }
}
