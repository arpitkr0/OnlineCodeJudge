package com.codejudge.submission;

import com.codejudge.auth.AuthService;
import com.codejudge.auth.User;
import com.codejudge.execution.WorkerManager;
import com.codejudge.problem.Difficulty;
import com.codejudge.problem.Problem;
import com.codejudge.problem.ProblemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SubmissionServiceTest {
    @Test
    void savesPendingSubmissionAndDispatchesLocalWorkerWhenKafkaDisabled() {
        SubmissionRepository submissions = mock(SubmissionRepository.class);
        ProblemRepository problems = mock(ProblemRepository.class);
        AuthService auth = mock(AuthService.class);
        KafkaTemplate<String, String> kafka = mock(KafkaTemplate.class);
        WorkerManager worker = mock(WorkerManager.class);

        SubmissionService service = new SubmissionService(submissions, problems, auth, kafka, worker);
        ReflectionTestUtils.setField(service, "kafkaEnabled", false);
        ReflectionTestUtils.setField(service, "submissionsTopic", "code-submissions");

        User user = new User();
        user.setId(1L);
        user.setUsername("alice");

        Problem problem = new Problem();
        problem.setId(10L);
        problem.setTitle("Sum Array");
        problem.setDifficulty(Difficulty.EASY);
        problem.setDescription("Sum numbers");
        problem.setTimeLimitMs(2000);
        problem.setMemoryLimitMb(256);

        when(auth.me("alice")).thenReturn(user);
        when(problems.findById(10L)).thenReturn(Optional.of(problem));
        when(submissions.save(any(Submission.class))).thenAnswer(invocation -> {
            Submission submission = invocation.getArgument(0);
            submission.setId(99L);
            return submission;
        });

        SubmissionResponse response = service.submit("alice", new SubmissionRequest(10L, Language.JAVA, "code"));

        assertThat(response.id()).isEqualTo(99L);
        assertThat(response.status()).isEqualTo(SubmissionStatus.PENDING);
        verify(worker).executeAsync(99L);
        verifyNoInteractions(kafka);
    }
}
