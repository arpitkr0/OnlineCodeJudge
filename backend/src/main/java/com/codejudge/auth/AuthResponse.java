package com.codejudge.auth;

public record AuthResponse(String token, UserResponse user) {
    public static AuthResponse from(User user, String token) {
        return new AuthResponse(token, UserResponse.from(user));
    }
}
