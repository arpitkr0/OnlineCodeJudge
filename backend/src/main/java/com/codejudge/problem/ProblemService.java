package com.codejudge.problem;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProblemService {
    private final ProblemRepository problemRepository;

    @Transactional
    public ProblemResponse create(ProblemRequest request) {
        Problem problem = new Problem();
        apply(problem, request);
        return ProblemResponse.from(problemRepository.save(problem), true);
    }

    @Transactional(readOnly = true)
    public Page<ProblemResponse> list(Difficulty difficulty, Pageable pageable) {
        Page<Problem> page = difficulty == null
                ? problemRepository.findAll(pageable)
                : problemRepository.findByDifficulty(difficulty, pageable);
        return page.map(problem -> ProblemResponse.from(problem, false));
    }

    @Transactional(readOnly = true)
    public ProblemResponse get(Long id, boolean includeHidden) {
        Problem problem = problemRepository.findWithTestCasesById(id)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found"));
        return ProblemResponse.from(problem, includeHidden);
    }

    @Transactional
    public ProblemResponse update(Long id, ProblemRequest request) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found"));
        apply(problem, request);
        return ProblemResponse.from(problem, true);
    }

    @Transactional
    public ProblemResponse addTestCase(Long id, TestCaseRequest request) {
        Problem problem = problemRepository.findWithTestCasesById(id)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found"));
        TestCase testCase = new TestCase();
        testCase.setInput(request.input());
        testCase.setExpectedOutput(request.expectedOutput());
        testCase.setHidden(request.hidden());
        problem.addTestCase(testCase);
        return ProblemResponse.from(problemRepository.save(problem), true);
    }

    private void apply(Problem problem, ProblemRequest request) {
        problem.setTitle(request.title());
        problem.setDescription(request.description());
        problem.setDifficulty(request.difficulty());
        problem.setTimeLimitMs(request.timeLimitMs());
        problem.setMemoryLimitMb(request.memoryLimitMb());
    }
}
