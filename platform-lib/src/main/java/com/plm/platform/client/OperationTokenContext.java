package com.plm.platform.client;

/**
 * Async-context propagation for the current operation (job) ID.
 * Set by PlmAuthFilter when processing a typ=op JWT, and by
 * ImportJobProcessor when minting an operation token at the start
 * of async work. ServiceClient reads this to add X-Job-Id to S2S requests.
 */
public final class OperationTokenContext {

    private static final ThreadLocal<String> JOB_ID = new ThreadLocal<>();

    private OperationTokenContext() {}

    public static void set(String jobId) { JOB_ID.set(jobId); }
    public static String get()           { return JOB_ID.get(); }
    public static void clear()           { JOB_ID.remove(); }
}
