package com.codejudge.resilience;

import com.codejudge.realtime.VerdictWebSocketHandler;
import com.codejudge.submission.Submission;
import com.codejudge.submission.SubmissionRepository;
import com.codejudge.submission.SubmissionResponse;
import com.codejudge.submission.SubmissionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DeadLetterConsumer {
    private final SubmissionRepository submissionRepository;
    private final VerdictWebSocketHandler webSocketHandler;

    @Transactional
    @KafkaListener(topics = "${app.kafka.dlq-topic:code-submissions-dlq}", autoStartup = "${app.kafka.enabled:false}")
    public void consume(String submissionId) {
        Submission submission = submissionRepository.findDetailedById(Long.valueOf(submissionId)).orElse(null);
        if (submission == null) {
            return;
        }
        submission.setStatus(SubmissionStatus.SYSTEM_ERROR);
        submission.setErrorMessage("Submission was routed to the dead letter queue after repeated worker failures.");
        submissionRepository.save(submission);
        webSocketHandler.publish(SubmissionResponse.from(submission));
    }
}
