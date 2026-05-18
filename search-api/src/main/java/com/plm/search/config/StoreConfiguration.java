package com.plm.search.config;

import com.plm.search.adapter.lucene.LuceneEdgeStore;
import com.plm.search.adapter.lucene.LuceneNodeStore;
import com.plm.search.port.EdgeStore;
import com.plm.search.port.NodeStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!opensearch")
public class StoreConfiguration {

    @Value("${search.index.path:}")
    private String indexPath;

    @Value("${search.index.ram-buffer-mb:64}")
    private int ramBufferMb;

    @Value("${search.facets.top-n:50}")
    private int topN;

    @Bean
    public NodeStore nodeStore() throws Exception {
        return new LuceneNodeStore(indexPath, ramBufferMb, topN);
    }

    @Bean
    public EdgeStore edgeStore() throws Exception {
        return new LuceneEdgeStore(indexPath, ramBufferMb);
    }
}
