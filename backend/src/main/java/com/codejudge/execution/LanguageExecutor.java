package com.codejudge.execution;

import com.codejudge.problem.Problem;
import com.codejudge.submission.Submission;
import java.util.List;

public interface LanguageExecutor {
    ExecutionResult execute(Submission submission, Problem problem, String input);

    default List<ExecutionResult> executeBatch(Submission submission, Problem problem, List<String> inputs) {
        return inputs.stream()
                .map(input -> execute(submission, problem, input))
                .toList();
    }
}
