package com.codejudge.problem;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Page<Problem> findByDifficulty(Difficulty difficulty, Pageable pageable);

    @EntityGraph(attributePaths = "testCases")
    Optional<Problem> findWithTestCasesById(Long id);

    boolean existsByTitle(String title);
}
