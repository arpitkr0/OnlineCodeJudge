package com.codejudge.submission;

import com.codejudge.auth.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    @EntityGraph(attributePaths = {"user", "problem"})
    Optional<Submission> findDetailedById(Long id);

    @EntityGraph(attributePaths = {"user", "problem"})
    @Query("SELECT s FROM Submission s WHERE s.user = :user AND (s.sampleOnly IS NULL OR s.sampleOnly = false) ORDER BY s.createdAt DESC")
    Page<Submission> findByUserOrderByCreatedAtDesc(@Param("user") User user, Pageable pageable);
}
