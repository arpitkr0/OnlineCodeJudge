package com.codejudge.submission;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {
    private final SubmissionService submissionService;

    @PostMapping
    @Operation(summary = "Submit code and immediately receive a pending submission id")
    public SubmissionResponse submit(Authentication authentication, @Valid @RequestBody SubmissionRequest request) {
        return submissionService.submit(authentication.getName(), request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Fetch one submission verdict")
    public SubmissionResponse get(@PathVariable Long id) {
        return submissionService.get(id);
    }

    @GetMapping("/me")
    @Operation(summary = "Fetch current user's submission history")
    public Page<SubmissionResponse> mine(Authentication authentication, Pageable pageable) {
        return submissionService.mine(authentication.getName(), pageable);
    }
}
