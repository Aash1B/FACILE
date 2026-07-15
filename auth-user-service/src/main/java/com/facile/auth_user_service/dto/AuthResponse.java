package com.facile.auth_user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String email;
    private String name;
    private String role;
    private boolean requiresVerification;
    private boolean requiresMfa;
    private String mfaToken;
}
