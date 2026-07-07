package com.codejudge.realtime;

import com.codejudge.submission.SubmissionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VerdictWebSocketHandler {
    private final SimpMessagingTemplate messagingTemplate;

    public void publish(SubmissionResponse response) {
        messagingTemplate.convertAndSend("/topic/submissions/" + response.id(), response);
        messagingTemplate.convertAndSend("/topic/users/submissions", response);
    }
}
