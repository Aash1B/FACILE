package com.facile.auth_user_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MfaEnableRequest {
    @NotBlank(message = "Verification code is required")
    private String code;
}
