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
    protected String compileCmd() {
        return "g++ -std=c++17 main.cpp -O2 -o main";
    }

    @Override
    protected String execCmd() {
        return "./main";
    }

    @Override
    protected String demoOutput(String code, String input) {
        return DemoRunner.outputFor(code, input);
    }
}
