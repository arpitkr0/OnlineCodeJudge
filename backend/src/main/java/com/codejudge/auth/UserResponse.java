package com.codejudge.auth;

public record UserResponse(Long id, String username, String email, Role role) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}
