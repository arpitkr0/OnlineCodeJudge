package com.codejudge.execution;

import org.springframework.stereotype.Component;

@Component
public class CppExecutor extends AbstractDockerExecutor {
    @Override
    protected String fileName() {
        return "main.cpp";
    }

    @Override
    protected String imageName() {
        return "judge-cpp:latest";
    }

    @Override
    protected String runCommand(String input, int timeLimitMs) {
        int timeoutSec = Math.max(2, (timeLimitMs + 1500) / 1000);
        return "cd /code && g++ -std=c++17 main.cpp -O2 -o main; ec=$?; if [ $ec -ne 0 ]; then exit $ec; fi; start=$(date +%s%3N); printf '%s' '" + input + "' | timeout " + timeoutSec + " ./main; ec=$?; end=$(date +%s%3N); echo \"---RUNTIME_MS---$((end - start))\" >&2; exit $ec";
    }

    @Override
    protected String demoOutput(String code, String input) {
        return DemoRunner.outputFor(code, input);
    }
}
