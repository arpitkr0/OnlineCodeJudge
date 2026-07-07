package com.codejudge.execution;

import java.util.Arrays;

final class DemoRunner {
    private DemoRunner() {
    }

    static String outputFor(String code, String input) {
        if (code.toLowerCase().contains("wrong")) {
            return "14\n";
        }
        if (code.toLowerCase().contains("runtime")) {
            throw new IllegalStateException("Demo runtime error");
        }
        long sum = Arrays.stream(input.trim().split("\\s+"))
                .filter(token -> token.matches("-?\\d+"))
                .mapToLong(Long::parseLong)
                .sum();
        return sum + "\n";
    }
}
