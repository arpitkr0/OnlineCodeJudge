package com.codejudge.submission;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmissionRequest(@NotNull Long problemId, @NotNull Language language, @NotBlank String code, Boolean sampleOnly) {
    public SubmissionRequest(Long problemId, Language language, String code) {
        this(problemId, language, code, false);
    }
}
