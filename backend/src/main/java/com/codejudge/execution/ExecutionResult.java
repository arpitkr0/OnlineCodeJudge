package com.codejudge.execution;

public record ExecutionResult(String output, String stderr, ExecutionMetrics metrics, boolean timedOut, boolean memoryExceeded) {
    public ExecutionResult(String output, String stderr, ExecutionMetrics metrics, boolean timedOut) {
        this(output, stderr, metrics, timedOut, false);
    }

    public static ExecutionResult systemError(String message) {
        return new ExecutionResult("", message, ExecutionMetrics.empty(), false, false);
    }
}
