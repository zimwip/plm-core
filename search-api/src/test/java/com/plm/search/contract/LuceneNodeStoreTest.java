package com.plm.search.contract;

import com.plm.search.adapter.lucene.LuceneNodeStore;
import com.plm.search.port.NodeStore;

class LuceneNodeStoreTest extends NodeStoreContractTest {

    @Override
    protected NodeStore createStore() throws Exception {
        return new LuceneNodeStore("", 16, 50);
    }
}
