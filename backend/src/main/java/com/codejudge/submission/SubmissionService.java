package com.codejudge.submission;

import com.codejudge.auth.AuthService;
import com.codejudge.auth.User;
import com.codejudge.execution.WorkerManager;
import com.codejudge.problem.Problem;
import com.codejudge.problem.ProblemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final AuthService authService;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final WorkerManager workerManager;

    @Value("${app.kafka.enabled:false}")
    private boolean kafkaEnabled;

    @Value("${app.kafka.submissions-topic:code-submissions}")
    private String submissionsTopic;

    @Transactional
    public SubmissionResponse submit(String username, SubmissionRequest request) {
        User user = authService.me(username);
        Problem problem = problemRepository.findById(request.problemId())
                .orElseThrow(() -> new EntityNotFoundException("Problem not found"));

        Submission submission = new Submission();
        submission.setUser(user);
        submission.setProblem(problem);
        submission.setLanguage(request.language());
        submission.setCode(request.code());
        submission.setSampleOnly(Boolean.TRUE.equals(request.sampleOnly()));
        submission.setStatus(SubmissionStatus.PENDING);
        Submission saved = submissionRepository.save(submission);

        Runnable dispatch = () -> {
            if (kafkaEnabled) {
                kafkaTemplate.send(submissionsTopic, saved.getId().toString());
            } else {
                workerManager.executeAsync(saved.getId());
            }
        };
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    dispatch.run();
                }
            });
        } else {
            dispatch.run();
        }
        return SubmissionResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public SubmissionResponse get(Long id) {
        return submissionRepository.findDetailedById(id)
                .map(SubmissionResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Submission not found"));
    }

    @Transactional(readOnly = true)
    public Page<SubmissionResponse> mine(String username, Pageable pageable) {
        User user = authService.me(username);
        return submissionRepository.findByUserOrderByCreatedAtDesc(user, pageable).map(SubmissionResponse::from);
    }
}
