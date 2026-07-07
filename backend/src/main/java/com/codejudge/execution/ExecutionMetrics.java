package com.codejudge.execution;

public record ExecutionMetrics(long runtimeMs, int memoryMb, double cpuUsage) {
    public static ExecutionMetrics empty() {
        return new ExecutionMetrics(0, 0, 0);
    }
}
