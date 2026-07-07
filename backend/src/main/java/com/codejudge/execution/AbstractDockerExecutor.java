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

    @Value("${DOCKER_VOLUME:}")
    private String dockerVolume;

    @Value("${app.execution.default-cpus:0.5}")
    private String cpus;

    @Value("${app.execution.pids-limit:50}")
    private String pidsLimit;

    protected abstract String fileName();

    protected abstract String imageName();

    protected abstract String compileCmd();

    protected abstract String execCmd();

    protected abstract String demoOutput(String code, String input);

    @Override
    public ExecutionResult execute(Submission submission, Problem problem, String input) {
        return executeBatch(submission, problem, List.of(input)).get(0);
    }

    @Override
    public List<ExecutionResult> executeBatch(Submission submission, Problem problem, List<String> inputs) {
        if (!dockerEnabled) {
            List<ExecutionResult> results = new ArrayList<>();
            for (String input : inputs) {
                Instant start = Instant.now();
                long runtime = Math.max(1, Duration.between(start, Instant.now()).toMillis() + 12);
                try {
                    String output = demoOutput(submission.getCode(), input);
                    results.add(new ExecutionResult(output, "", new ExecutionMetrics(runtime, 24, 18.5), false));
                } catch (RuntimeException ex) {
                    results.add(new ExecutionResult("", ex.getMessage(), new ExecutionMetrics(runtime, 24, 18.5), false));
                }
            }
            return results;
        }

        Path directory = Path.of(workspaceRoot, "submission-" + submission.getId() + "-" + System.nanoTime());
        try {
            Files.createDirectories(directory);
            String code = submission.getCode() == null ? "" : submission.getCode().replace("\r\n", "\n").replace("\r", "\n");
            Files.writeString(directory.resolve(fileName()), code, StandardCharsets.UTF_8);
            for (int i = 0; i < inputs.size(); i++) {
                String inputStr = inputs.get(i) == null ? "" : inputs.get(i).replace("\r\n", "\n").replace("\r", "\n");
                Files.writeString(directory.resolve("input_" + i + ".txt"), inputStr, StandardCharsets.UTF_8);
            }

            int timeoutSec = Math.max(2, (problem.getTimeLimitMs() + 1500) / 1000);
            String subDirName = directory.getFileName().toString();
            StringBuilder script = new StringBuilder();
            script.append("#!/bin/sh\n");
            script.append("cd /workspace/").append(subDirName).append("\n");
            String compile = compileCmd();
            if (compile != null && !compile.isBlank()) {
                script.append(compile).append(" > compile_err.txt 2>&1\n");
                script.append("ec=$?\n");
                script.append("if [ $ec -ne 0 ]; then\n");
                script.append("  echo $ec > compile_exit.txt\n");
                script.append("  exit $ec\n");
                script.append("fi\n");
            }
            script.append("i=0\n");
            script.append("while [ $i -lt ").append(inputs.size()).append(" ]; do\n");
            script.append("  start=$(date +%s%N | cut -b1-13)\n");
            script.append("  timeout ").append(timeoutSec).append(" ").append(execCmd()).append(" < \"input_${i}.txt\" > \"output_${i}.txt\" 2> \"stderr_${i}.txt\"\n");
            script.append("  ec=$?\n");
            script.append("  end=$(date +%s%N | cut -b1-13)\n");
            script.append("  echo $ec > \"exit_${i}.txt\"\n");
            script.append("  echo $((end - start)) > \"runtime_${i}.txt\"\n");
            script.append("  i=$((i + 1))\n");
            script.append("done\n");

            Files.writeString(directory.resolve("runner.sh"), script.toString(), StandardCharsets.UTF_8);

            makeWorldWritable(directory.getParent());
            try (var paths = Files.walk(directory)) {
                paths.forEach(this::makeWorldWritable);
            } catch (IOException ignored) {
            }

            List<String> command = dockerCommand(directory, problem);
            Instant start = Instant.now();
            Process process = new ProcessBuilder(command).redirectErrorStream(false).start();
            long maxTotalWaitMs = Math.max(15000L, (long) problem.getTimeLimitMs() * inputs.size() + 10000L);
            boolean finished = process.waitFor(maxTotalWaitMs, TimeUnit.MILLISECONDS);
            if (!finished) {
                process.destroyForcibly();
            }

            Path compileErrPath = directory.resolve("compile_err.txt");
            if (Files.exists(compileErrPath)) {
                String compileErr = Files.readString(compileErrPath, StandardCharsets.UTF_8).trim();
                Path compileExitPath = directory.resolve("compile_exit.txt");
                if (Files.exists(compileExitPath) || (!compileErr.isEmpty() && !finished)) {
                    List<ExecutionResult> compileResults = new ArrayList<>();
                    for (int i = 0; i < inputs.size(); i++) {
                        compileResults.add(new ExecutionResult("", compileErr, new ExecutionMetrics(0, 0, 0), false, false));
                    }
                    return compileResults;
                }
            }

            List<ExecutionResult> results = new ArrayList<>();
            for (int i = 0; i < inputs.size(); i++) {
                Path outPath = directory.resolve("output_" + i + ".txt");
                Path errPath = directory.resolve("stderr_" + i + ".txt");
                Path exitPath = directory.resolve("exit_" + i + ".txt");
                Path runPath = directory.resolve("runtime_" + i + ".txt");

                if (!Files.exists(outPath) && !finished) {
                    results.add(new ExecutionResult("", "Timed out", new ExecutionMetrics(problem.getTimeLimitMs() + 1, problem.getMemoryLimitMb(), 100), true));
                    continue;
                }

                String output = Files.exists(outPath) ? Files.readString(outPath, StandardCharsets.UTF_8) : "";
                String stderr = Files.exists(errPath) ? Files.readString(errPath, StandardCharsets.UTF_8) : "";
                int exitCode = 0;
                if (Files.exists(exitPath)) {
                    try {
                        exitCode = Integer.parseInt(Files.readString(exitPath, StandardCharsets.UTF_8).trim());
                    } catch (NumberFormatException ignored) {}
                }
                long runtime = 0;
                if (Files.exists(runPath)) {
                    try {
                        runtime = Long.parseLong(Files.readString(runPath, StandardCharsets.UTF_8).trim());
                    } catch (NumberFormatException ignored) {}
                }
                if (runtime <= 0) {
                    runtime = Math.max(1, Duration.between(start, Instant.now()).toMillis() / Math.max(1, inputs.size()));
                }

                boolean timedOut = (exitCode == 124) || (runtime > problem.getTimeLimitMs());
                boolean memoryExceeded = (exitCode == 137) || stderr.toLowerCase().contains("memory");
                results.add(new ExecutionResult(output, stderr, new ExecutionMetrics(runtime, problem.getMemoryLimitMb(), 35.0), timedOut, memoryExceeded));
            }
            return results;
        } catch (IOException ex) {
            List<ExecutionResult> errResults = new ArrayList<>();
            for (int i = 0; i < inputs.size(); i++) {
                errResults.add(ExecutionResult.systemError("Docker execution failed: " + ex.getMessage()));
            }
            return errResults;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            List<ExecutionResult> errResults = new ArrayList<>();
            for (int i = 0; i < inputs.size(); i++) {
                errResults.add(ExecutionResult.systemError("Execution interrupted"));
            }
            return errResults;
        } finally {
            deleteQuietly(directory);
        }
    }

    private List<String> dockerCommand(Path directory, Problem problem) {
        String vol = (dockerVolume != null && !dockerVolume.isBlank())
                ? dockerVolume
                : directory.getParent().toAbsolutePath().toString();
        return new ArrayList<>(List.of(
                "docker", "run", "--rm",
                "--memory=" + problem.getMemoryLimitMb() + "m",
                "--cpus=" + cpus,
                "--network=none",
                "--pids-limit=" + pidsLimit,
                "--read-only",
                "--tmpfs", "/tmp:exec",
                "--cap-drop=ALL",
                "--security-opt=no-new-privileges",
                "-w", "/workspace/" + directory.getFileName().toString(),
                "-v", vol + ":/workspace",
                imageName(),
                "sh", "runner.sh"
        ));
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

    private void makeWorldWritable(Path path) {
        if (path == null || !Files.exists(path)) {
            return;
        }
        try {
            path.toFile().setWritable(true, false);
            path.toFile().setReadable(true, false);
            path.toFile().setExecutable(true, false);
        } catch (Exception ignored) {
        }
        try {
            var view = Files.getFileAttributeView(path, java.nio.file.attribute.PosixFileAttributeView.class);
            if (view != null) {
                Files.setPosixFilePermissions(path, java.nio.file.attribute.PosixFilePermissions.fromString("rwxrwxrwx"));
            }
        } catch (Exception ignored) {
        }
    }
}
