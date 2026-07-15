package com.facile.auth_user_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MfaVerifyRequest {
    @NotBlank(message = "MFA state token is required")
    private String mfaToken;

    @NotBlank(message = "Verification code is required")
    private String code;
}
