package com.codejudge.problem;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {
    private final ProblemService problemService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a problem")
    public ProblemResponse create(@Valid @RequestBody ProblemRequest request) {
        return problemService.create(request);
    }

    @GetMapping
    @Operation(summary = "List problems with optional difficulty filter")
    public Page<ProblemResponse> list(@RequestParam(required = false) Difficulty difficulty, Pageable pageable) {
        return problemService.list(difficulty, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get one problem, hiding private tests from normal users")
    public ProblemResponse get(@PathVariable Long id, Authentication authentication) {
        boolean admin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        return problemService.get(id, admin);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a problem")
    public ProblemResponse update(@PathVariable Long id, @Valid @RequestBody ProblemRequest request) {
        return problemService.update(id, request);
    }

    @PostMapping("/{id}/testcases")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add a sample or hidden test case")
    public ProblemResponse addTestCase(@PathVariable Long id, @Valid @RequestBody TestCaseRequest request) {
        return problemService.addTestCase(id, request);
    }
}
