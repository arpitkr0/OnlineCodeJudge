package com.codejudge.execution;

import com.codejudge.problem.Problem;
import com.codejudge.problem.ProblemRepository;
import com.codejudge.problem.TestCase;
import com.codejudge.realtime.VerdictWebSocketHandler;
import com.codejudge.submission.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkerManager {
    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final ExecutorFactory executorFactory;
    private final VerdictEvaluator verdictEvaluator;
    private final VerdictWebSocketHandler webSocketHandler;

    @Async
    @Transactional
    public void executeAsync(Long submissionId) {
        executeSubmission(submissionId, false);
    }

    @Transactional
    public void executeSubmission(Long submissionId) {
        executeSubmission(submissionId, false);
    }

    @Transactional
    public void executeSubmissionForKafka(Long submissionId) {
        executeSubmission(submissionId, true);
    }

    private void executeSubmission(Long submissionId, boolean retrySystemErrors) {
        Submission submission = submissionRepository.findDetailedById(submissionId)
                .orElseThrow(() -> new EntityNotFoundException("Submission not found"));
        if (submission.getStatus() != SubmissionStatus.PENDING) {
            return;
        }

        Problem problem = problemRepository.findWithTestCasesById(submission.getProblem().getId())
                .orElseThrow(() -> new EntityNotFoundException("Problem not found"));
        submission.setStatus(SubmissionStatus.RUNNING);
        submissionRepository.saveAndFlush(submission);
        webSocketHandler.publish(SubmissionResponse.from(submission));

        List<TestCase> validTestCases = problem.getTestCases().stream()
                .filter(tc -> !Boolean.TRUE.equals(submission.getSampleOnly()) || !tc.isHidden())
                .toList();
        int total = validTestCases.size();
        int passed = 0;
        long maxRuntime = 0;
        int peakMemory = 0;
        double totalCpu = 0;

        try {
            LanguageExecutor executor = executorFactory.get(submission.getLanguage());
            List<String> inputs = validTestCases.stream().map(TestCase::getInput).toList();
            List<ExecutionResult> results = executor.executeBatch(submission, problem, inputs);

            for (int i = 0; i < validTestCases.size(); i++) {
                int index = i + 1;
                TestCase testCase = validTestCases.get(i);
                ExecutionResult result = results.get(i);
                SubmissionStatus verdict = verdictEvaluator.evaluate(result, testCase.getExpectedOutput(), problem.getTimeLimitMs());
                maxRuntime = Math.max(maxRuntime, result.metrics().runtimeMs());
                peakMemory = Math.max(peakMemory, result.metrics().memoryMb());
                totalCpu += result.metrics().cpuUsage();

                if (retrySystemErrors && verdict == SubmissionStatus.SYSTEM_ERROR) {
                    resetForRetry(submission, result.stderr());
                    throw new IllegalStateException(result.stderr());
                }
                if (verdict != SubmissionStatus.ACCEPTED) {
                    String err = result.stderr();
                    if (verdict == SubmissionStatus.WRONG_ANSWER) {
                        err = "Test Case #" + index + " Failed:\nInput:\n" + testCase.getInput().trim() + "\n\nExpected Output:\n" + testCase.getExpectedOutput().trim() + "\n\nYour Output:\n" + (result.output() == null ? "" : result.output().trim());
                    }
                    applyFinal(submission, verdict, passed, total, index, err, maxRuntime, peakMemory, averageCpu(totalCpu, index));
                    return;
                }
                passed++;
            }
            applyFinal(submission, SubmissionStatus.ACCEPTED, passed, total, null, null, maxRuntime, peakMemory, averageCpu(totalCpu, Math.max(total, 1)));
        } catch (Exception ex) {
            if (retrySystemErrors) {
                resetForRetry(submission, ex.getMessage());
                throw new IllegalStateException(ex);
            }
            applyFinal(submission, SubmissionStatus.SYSTEM_ERROR, passed, total, null, ex.getMessage(), maxRuntime, peakMemory, averageCpu(totalCpu, Math.max(passed, 1)));
        }
    }

    private void applyFinal(Submission submission, SubmissionStatus status, int passed, int total, Integer failedCase,
                            String error, long runtime, int memory, double cpu) {
        submission.setStatus(status);
        submission.setPassedTestCases(passed);
        submission.setTotalTestCases(total);
        submission.setFailedTestCase(failedCase);
        submission.setRuntimeMs(runtime);
        submission.setMemoryMb(memory);
        submission.setCpuUsage(cpu);
        submission.setErrorMessage(error == null || error.isBlank() ? null : error);
        submissionRepository.save(submission);
        webSocketHandler.publish(SubmissionResponse.from(submission));
    }

    private void resetForRetry(Submission submission, String error) {
        submission.setStatus(SubmissionStatus.PENDING);
        submission.setErrorMessage(error);
        submissionRepository.saveAndFlush(submission);
    }

    private double averageCpu(double totalCpu, int count) {
        return Math.round((totalCpu / Math.max(count, 1)) * 10.0) / 10.0;
    }
}
