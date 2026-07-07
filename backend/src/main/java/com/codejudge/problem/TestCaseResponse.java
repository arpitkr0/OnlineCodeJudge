package com.codejudge.problem;

public record TestCaseResponse(Long id, String input, String expectedOutput, boolean hidden) {
    static TestCaseResponse from(TestCase testCase, boolean includeHidden) {
        return new TestCaseResponse(
                testCase.getId(),
                testCase.isHidden() && !includeHidden ? null : testCase.getInput(),
                testCase.isHidden() && !includeHidden ? null : testCase.getExpectedOutput(),
                testCase.isHidden());
    }
}
