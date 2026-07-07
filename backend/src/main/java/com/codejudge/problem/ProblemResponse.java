package com.codejudge.problem;

import java.util.List;

public record ProblemResponse(
        Long id,
        String title,
        String description,
        Difficulty difficulty,
        int timeLimitMs,
        int memoryLimitMb,
        List<TestCaseResponse> testCases
) {
    public static ProblemResponse from(Problem problem, boolean includeHidden) {
        return new ProblemResponse(
                problem.getId(),
                problem.getTitle(),
                problem.getDescription(),
                problem.getDifficulty(),
                problem.getTimeLimitMs(),
                problem.getMemoryLimitMb(),
                problem.getTestCases().stream()
                        .filter(tc -> includeHidden || !tc.isHidden())
                        .map(tc -> TestCaseResponse.from(tc, includeHidden))
                        .toList());
    }
}
