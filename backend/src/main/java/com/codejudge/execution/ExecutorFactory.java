package com.codejudge.execution;

import com.codejudge.submission.Language;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ExecutorFactory {
    private final JavaExecutor javaExecutor;
    private final PythonExecutor pythonExecutor;
    private final CppExecutor cppExecutor;

    public LanguageExecutor get(Language language) {
        return switch (language) {
            case JAVA -> javaExecutor;
            case PYTHON -> pythonExecutor;
            case CPP -> cppExecutor;
        };
    }
}
