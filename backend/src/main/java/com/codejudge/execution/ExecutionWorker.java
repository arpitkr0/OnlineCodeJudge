package com.codejudge.execution;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ExecutionWorker {
    private final WorkerManager workerManager;

    @KafkaListener(topics = "${app.kafka.submissions-topic:code-submissions}", autoStartup = "${app.kafka.enabled:false}")
    public void consume(String submissionId) {
        workerManager.executeSubmissionForKafka(Long.valueOf(submissionId));
    }
}
