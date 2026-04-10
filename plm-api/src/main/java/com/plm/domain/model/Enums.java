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
