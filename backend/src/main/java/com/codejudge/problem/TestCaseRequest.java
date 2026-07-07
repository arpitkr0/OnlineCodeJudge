package com.codejudge.problem;

import jakarta.validation.constraints.NotNull;

public record TestCaseRequest(@NotNull String input, @NotNull String expectedOutput, boolean hidden) {
}
