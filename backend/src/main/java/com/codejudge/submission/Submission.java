package com.codejudge.submission;

import com.codejudge.auth.User;
import com.codejudge.problem.Problem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Problem problem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Language language;

    @Column(nullable = false, columnDefinition = "text")
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private SubmissionStatus status = SubmissionStatus.PENDING;

    private Long runtimeMs;
    private Integer memoryMb;
    private Double cpuUsage;
    private Integer passedTestCases;
    private Integer totalTestCases;
    private Integer failedTestCase;

    @Column(columnDefinition = "text")
    private String errorMessage;

    @Column(name = "sample_only")
    private Boolean sampleOnly = false;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
