package com.codejudge.execution;

import com.codejudge.submission.SubmissionStatus;
import org.springframework.stereotype.Component;

@Component
public class VerdictEvaluator {
    public SubmissionStatus evaluate(ExecutionResult result, String expected, int timeLimitMs) {
        if (result.stderr() != null && result.stderr().startsWith("Docker execution failed")) {
            return SubmissionStatus.SYSTEM_ERROR;
        }
        if (result.timedOut() || result.metrics().runtimeMs() > timeLimitMs) {
            return SubmissionStatus.TIME_LIMIT_EXCEEDED;
        }
        if (result.memoryExceeded()) {
            return SubmissionStatus.MEMORY_LIMIT_EXCEEDED;
        }
        String stderr = result.stderr() == null ? "" : result.stderr().toLowerCase();
        if (!stderr.isBlank() && isCompileError(stderr)) {
            return SubmissionStatus.COMPILATION_ERROR;
        }
        if (!stderr.isBlank()) {
            return SubmissionStatus.RUNTIME_ERROR;
        }
        if (normalize(result.output()).equals(normalize(expected))) {
            return SubmissionStatus.ACCEPTED;
        }
        return SubmissionStatus.WRONG_ANSWER;
    }

    private boolean isCompileError(String stderr) {
        return stderr.contains("compilation") || stderr.contains("javac") || stderr.contains("syntaxerror") || stderr.contains("error:");
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().replace("\r\n", "\n");
    }
}
