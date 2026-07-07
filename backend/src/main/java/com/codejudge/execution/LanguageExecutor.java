package com.codejudge.execution;

import com.codejudge.problem.Problem;
import com.codejudge.submission.Submission;

public interface LanguageExecutor {
    ExecutionResult execute(Submission submission, Problem problem, String input);
}
