package com.codejudge.execution;

import org.springframework.stereotype.Component;

@Component
public class JavaExecutor extends AbstractDockerExecutor {
    @Override
    protected String fileName() {
        return "Main.java";
    }

    @Override
    protected String imageName() {
        return "judge-java:latest";
    }

    @Override
    protected String compileCmd() {
        return "javac Main.java";
    }

    @Override
    protected String execCmd() {
        return "java Main";
    }

    @Override
    protected String demoOutput(String code, String input) {
        return DemoRunner.outputFor(code, input);
    }
}
