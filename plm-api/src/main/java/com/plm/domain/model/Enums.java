package com.plm.domain.model;

public final class Enums {

    public enum LinkPolicy {
        VERSION_TO_MASTER,
        VERSION_TO_VERSION
    }

    public enum ChangeType {
        CONTENT,
        LIFECYCLE,
        SIGNATURE
    }

    public enum TransactionStatus {
        OPEN,
        COMMITTED,
        ROLLEDBACK
    }

    public enum VersionStrategy {
        NONE,     // same revision.iteration (traceability only)
        ITERATE,  // iteration + 1  (A.1 → A.2)
        REVISE    // next revision, iteration reset to 1 (A.x → B.1)
    }

    public enum NumberingScheme {
        ALPHA_NUMERIC  // Default: A.1, A.2, B.1 ... (single-letter revision, numeric iteration)
    }

    public enum ActionType {
        CASCADE_FROZEN,
        REQUIRE_SIGNATURE,
        NONE
    }

    public enum DataType {
        STRING,
        NUMBER,
        DATE,
        BOOLEAN,
        ENUM
    }

    private Enums() {}
}
