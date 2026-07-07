package com.codejudge.execution;

import com.codejudge.problem.Problem;
import com.codejudge.submission.Submission;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RequiredArgsConstructor
abstract class AbstractDockerExecutor implements LanguageExecutor {
    @Value("${app.execution.docker-enabled:false}")
    private boolean dockerEnabled;

    @Value("${app.execution.workspace-root:${java.io.tmpdir}/codejudge}")
    private String workspaceRoot;

    @Value("${app.execution.default-cpus:0.5}")
    private String cpus;

    @Value("${app.execution.pids-limit:50}")
    private String pidsLimit;

    protected abstract String fileName();

    protected abstract String imageName();

    protected abstract String runCommand(String input, int timeLimitMs);

    protected abstract String demoOutput(String code, String input);

    @Override
    public ExecutionResult execute(Submission submission, Problem problem, String input) {
        if (!dockerEnabled) {
            Instant start = Instant.now();
            long runtime = Math.max(1, Duration.between(start, Instant.now()).toMillis() + 12);
            try {
                String output = demoOutput(submission.getCode(), input);
                return new ExecutionResult(output, "", new ExecutionMetrics(runtime, 24, 18.5), false);
            } catch (RuntimeException ex) {
                return new ExecutionResult("", ex.getMessage(), new ExecutionMetrics(runtime, 24, 18.5), false);
            }
        }

        Path directory = Path.of(workspaceRoot, "submission-" + submission.getId() + "-" + System.nanoTime());
        try {
            Files.createDirectories(directory);
            Files.writeString(directory.resolve(fileName()), submission.getCode(), StandardCharsets.UTF_8);
            List<String> command = dockerCommand(directory, problem, input);
            Instant start = Instant.now();
            Process process = new ProcessBuilder(command).redirectErrorStream(false).start();
            boolean finished = process.waitFor(Math.max(15000L, problem.getTimeLimitMs() + 10000L), TimeUnit.MILLISECONDS);
            if (!finished) {
                process.destroyForcibly();
                long runtime = Duration.between(start, Instant.now()).toMillis();
                return new ExecutionResult("", "Timed out", new ExecutionMetrics(runtime, problem.getMemoryLimitMb(), 100), true);
            }
            int exitCode = process.exitValue();
            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            String rawStderr = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
            long runtime = Duration.between(start, Instant.now()).toMillis();
            String stderr = rawStderr;
            if (rawStderr.contains("---RUNTIME_MS---")) {
                for (String line : rawStderr.split("\r?\n")) {
                    if (line.trim().startsWith("---RUNTIME_MS---")) {
                        try {
                            String msStr = line.trim().substring("---RUNTIME_MS---".length());
                            long measuredMs = Long.parseLong(msStr);
                            if (measuredMs >= 0) {
                                runtime = measuredMs;
                            }
                        } catch (NumberFormatException ignored) {}
                    }
                }
                stderr = rawStderr.replaceAll("(?m)^---RUNTIME_MS---.*(\\r?\\n)?", "").trim();
            }
            boolean timedOut = (exitCode == 124) || (runtime > problem.getTimeLimitMs());
            boolean memoryExceeded = (exitCode == 137) || stderr.toLowerCase().contains("memory");
            return new ExecutionResult(output, stderr, new ExecutionMetrics(runtime, problem.getMemoryLimitMb(), 35.0), timedOut, memoryExceeded);
        } catch (IOException ex) {
            return ExecutionResult.systemError("Docker execution failed: " + ex.getMessage());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return ExecutionResult.systemError("Execution interrupted");
        } finally {
            deleteQuietly(directory);
        }
    }

    private List<String> dockerCommand(Path directory, Problem problem, String input) {
        List<String> command = new ArrayList<>(List.of(
                "docker", "run", "--rm",
                "--memory=" + problem.getMemoryLimitMb() + "m",
                "--cpus=" + cpus,
                "--network=none",
                "--pids-limit=" + pidsLimit,
                "--read-only",
                "--cap-drop=ALL",
                "--security-opt=no-new-privileges",
                "-v", directory.toAbsolutePath() + ":/code",
                imageName(),
                "sh", "-c", runCommand(escapeForSingleQuotedEcho(input), problem.getTimeLimitMs())
        ));
        return command;
    }

    private String escapeForSingleQuotedEcho(String value) {
        return value.replace("'", "'\"'\"'");
    }

    private void deleteQuietly(Path directory) {
        if (directory == null || !Files.exists(directory)) {
            return;
        }
        try (var paths = Files.walk(directory)) {
            paths.sorted((left, right) -> right.compareTo(left)).forEach(path -> {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException ignored) {
                }
            });
        } catch (IOException ignored) {
        }
    }
}
