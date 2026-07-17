package com.facile.auth_user_service.controller;

import com.facile.auth_user_service.dto.*;
import com.facile.auth_user_service.model.User;
import com.facile.auth_user_service.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(authService.verifyOtp(request, userAgent, ip));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Void> resendOtp(
            @Valid @RequestBody ResendOtpRequest request
    ) {
        authService.resendOtp(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        try {
            return ResponseEntity.ok(authService.login(request, userAgent, ip));
        } catch (org.springframework.security.core.AuthenticationException ex) {
            authService.logFailedLogin(request.getEmail(), ip, userAgent);
            throw ex;
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(authService.refreshToken(request, userAgent, ip));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(authService.loginWithGoogle(request, userAgent, ip));
    }

    @PostMapping("/mfa/setup")
    public ResponseEntity<MfaSetupResponse> setupMfa() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(authService.setupMfa(user));
    }

    @PostMapping("/mfa/enable")
    public ResponseEntity<Void> enableMfa(@Valid @RequestBody MfaEnableRequest request) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        authService.enableMfa(user, request.getCode());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mfa/disable")
    public ResponseEntity<Void> disableMfa() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        authService.disableMfa(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<AuthResponse> verifyMfa(
            @Valid @RequestBody MfaVerifyRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(authService.verifyMfa(request, userAgent, ip));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<UserSessionResponse>> getSessions() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(authService.getSessions(user));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> revokeSession(@PathVariable Long id) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        authService.revokeSession(user, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogs() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(authService.getAuditLogs(user));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof com.facile.auth_user_service.model.User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        com.facile.auth_user_service.model.User user = (com.facile.auth_user_service.model.User) auth.getPrincipal();
        return ResponseEntity.ok(UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .mfaEnabled(user.isMfaEnabled())
                .build());
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof com.facile.auth_user_service.model.User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        com.facile.auth_user_service.model.User user = (com.facile.auth_user_service.model.User) auth.getPrincipal();
        authService.deleteAccount(user.getId());
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/sellers")
    public ResponseEntity<List<UserResponse>> getSellers() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof com.facile.auth_user_service.model.User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        com.facile.auth_user_service.model.User user = (com.facile.auth_user_service.model.User) auth.getPrincipal();
        if (user.getRole() != com.facile.auth_user_service.model.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(authService.getSellers());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) RefreshTokenRequest request) {
        if (request != null && request.getRefreshToken() != null) {
            authService.deleteSessionByToken(request.getRefreshToken());
        }
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(org.springframework.security.authentication.DisabledException.class)
    public ResponseEntity<Map<String, String>> handleDisabledException(org.springframework.security.authentication.DisabledException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("error", "Account is not verified. Please verify your email first.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errors);
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthenticationException(Exception ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("error", "Invalid credentials");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errors);
    }
}
