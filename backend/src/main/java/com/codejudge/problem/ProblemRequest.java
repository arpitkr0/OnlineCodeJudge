package com.codejudge.problem;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProblemRequest(
        @NotBlank @Size(max = 160) String title,
        @NotBlank String description,
        @NotNull Difficulty difficulty,
        @Min(100) int timeLimitMs,
        @Min(16) int memoryLimitMb
) {
}
