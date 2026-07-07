package com.codejudge.submission;

public record SubmissionResponse(
        Long id,
        Long problemId,
        String problemTitle,
        Language language,
        SubmissionStatus status,
        Long runtimeMs,
        Integer memoryMb,
        Double cpuUsage,
        Integer passedTestCases,
        Integer totalTestCases,
        Integer failedTestCase,
        String errorMessage,
        Boolean sampleOnly
) {
    public static SubmissionResponse from(Submission submission) {
        return new SubmissionResponse(
                submission.getId(),
                submission.getProblem().getId(),
                submission.getProblem().getTitle(),
                submission.getLanguage(),
                submission.getStatus(),
                submission.getRuntimeMs(),
                submission.getMemoryMb(),
                submission.getCpuUsage(),
                submission.getPassedTestCases(),
                submission.getTotalTestCases(),
                submission.getFailedTestCase(),
                submission.getErrorMessage(),
                submission.getSampleOnly());
    }
}
