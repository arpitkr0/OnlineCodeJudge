package com.codejudge.execution;

import com.codejudge.submission.SubmissionStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class VerdictEvaluatorTest {
    private final VerdictEvaluator evaluator = new VerdictEvaluator();

    @Test
    void acceptsMatchingTrimmedOutput() {
        ExecutionResult result = new ExecutionResult("42\n", "", new ExecutionMetrics(10, 12, 20), false);

        assertThat(evaluator.evaluate(result, "42", 1000)).isEqualTo(SubmissionStatus.ACCEPTED);
    }

    @Test
    void detectsWrongAnswer() {
        ExecutionResult result = new ExecutionResult("41", "", new ExecutionMetrics(10, 12, 20), false);

        assertThat(evaluator.evaluate(result, "42", 1000)).isEqualTo(SubmissionStatus.WRONG_ANSWER);
    }

    @Test
    void detectsTimeLimitExceeded() {
        ExecutionResult result = new ExecutionResult("", "", new ExecutionMetrics(1500, 12, 100), true);

        assertThat(evaluator.evaluate(result, "42", 1000)).isEqualTo(SubmissionStatus.TIME_LIMIT_EXCEEDED);
    }

    @Test
    void detectsCompilationError() {
        ExecutionResult result = new ExecutionResult("", "javac Main.java error: missing ;", new ExecutionMetrics(10, 12, 20), false);

        assertThat(evaluator.evaluate(result, "42", 1000)).isEqualTo(SubmissionStatus.COMPILATION_ERROR);
    }

    @Test
    void detectsMemoryLimitExceeded() {
        ExecutionResult result = new ExecutionResult("", "killed by memory limit", new ExecutionMetrics(10, 256, 50), false, true);

        assertThat(evaluator.evaluate(result, "42", 1000)).isEqualTo(SubmissionStatus.MEMORY_LIMIT_EXCEEDED);
    }
}
