package com.codejudge.execution;

import org.springframework.stereotype.Component;

@Component
public class PythonExecutor extends AbstractDockerExecutor {
    @Override
    protected String fileName() {
        return "main.py";
    }

    @Override
    protected String imageName() {
        return "judge-python:latest";
    }

    @Override
    protected String compileCmd() {
        return "";
    }

    @Override
    protected String execCmd() {
        return "python main.py";
    }

    @Override
    protected String demoOutput(String code, String input) {
        return DemoRunner.outputFor(code, input);
    }
}
