package com.plm.search.contract;

import com.plm.search.adapter.lucene.LuceneEdgeStore;
import com.plm.search.port.EdgeStore;

class LuceneEdgeStoreTest extends EdgeStoreContractTest {

    @Override
    protected EdgeStore createStore() throws Exception {
        return new LuceneEdgeStore("", 16);
    }
}
