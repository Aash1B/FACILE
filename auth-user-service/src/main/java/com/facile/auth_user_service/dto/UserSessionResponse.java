package com.facile.auth_user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSessionResponse {
    private Long id;
    private String userAgent;
    private String ipAddress;
    private LocalDateTime lastActiveAt;
    private boolean isCurrentDevice;
}
