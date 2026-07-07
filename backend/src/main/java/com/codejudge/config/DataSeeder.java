package com.codejudge.config;

import com.codejudge.auth.Role;
import com.codejudge.auth.User;
import com.codejudge.auth.UserRepository;
import com.codejudge.problem.ProblemRepository;
import com.codejudge.submission.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Profile("!worker")
public class DataSeeder {
    private final PasswordEncoder passwordEncoder;


    @Bean
    CommandLineRunner seed(UserRepository users, ProblemRepository problems, SubmissionRepository submissions) {
        return args -> {
            if (!users.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@codejudge.local");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                users.save(admin);
            }
            ProblemGenerator.seedProblems(problems, submissions);
        };
    }
}
