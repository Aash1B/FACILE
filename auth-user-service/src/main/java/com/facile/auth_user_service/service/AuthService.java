package com.facile.auth_user_service.service;

import com.facile.auth_user_service.dto.*;
import com.facile.auth_user_service.model.*;
import com.facile.auth_user_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final UserSessionRepository userSessionRepository;
    private final AuditLogRepository auditLogRepository;
    private final TotpService totpService;

    public AuthResponse register(RegisterRequest request) {
        java.util.Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.isEnabled()) {
                throw new IllegalArgumentException("Email already in use");
            } else {
                // Update unverified user details and send new OTP
                String otpCode = generateOtp();
                existingUser.setName(request.getName());
                existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
                existingUser.setOtpCode(otpCode);
                existingUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
                User savedUser = userRepository.save(existingUser);
                
                emailService.sendOtpEmail(savedUser.getEmail(), savedUser.getName(), otpCode);
                
                return AuthResponse.builder()
                        .email(savedUser.getEmail())
                        .name(savedUser.getName())
                        .requiresVerification(true)
                        .build();
            }
        }

        String otpCode = generateOtp();
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .enabled(false) // Unverified by default
                .otpCode(otpCode)
                .otpExpiry(LocalDateTime.now().plusMinutes(5)) // 5 minute expiry
                .build();

        User savedUser = userRepository.save(user);
        
        // Dispatch OTP code
        emailService.sendOtpEmail(savedUser.getEmail(), savedUser.getName(), otpCode);

        // Return AuthResponse demanding verification
        return AuthResponse.builder()
                .email(savedUser.getEmail())
                .name(savedUser.getName())
                .requiresVerification(true)
                .build();
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request, String userAgent, String ipAddress) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.isEnabled()) {
            throw new IllegalArgumentException("Account is already verified");
        }

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtpCode())) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        // Enable user and clear OTP fields
        user.setEnabled(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        // Generate tokens upon successful verification
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Track session & audit
        registerSession(user, refreshToken, userAgent, ipAddress);
        AuditLog audit = AuditLog.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .action("REGISTER_OTP_VERIFIED")
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        auditLogRepository.save(audit);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .requiresVerification(false)
                .build();
    }

    public void resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.isEnabled()) {
            throw new IllegalArgumentException("Account is already verified");
        }

        String newOtpCode = generateOtp();
        user.setOtpCode(newOtpCode);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), user.getName(), newOtpCode);
    }

    public AuthResponse login(LoginRequest request, String userAgent, String ipAddress) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.isMfaEnabled()) {
            // Generate a temporary MFA pending token
            String mfaToken = jwtService.generateMfaToken(user);
            return AuthResponse.builder()
                    .requiresMfa(true)
                    .mfaToken(mfaToken)
                    .email(user.getEmail())
                    .name(user.getName())
                    .build();
        }

        // Check suspicious login
        checkSuspiciousLogin(user, ipAddress, userAgent);

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Register session & audit log
        registerSession(user, refreshToken, userAgent, ipAddress);
        AuditLog audit = AuditLog.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .action("LOGIN_SUCCESS")
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        auditLogRepository.save(audit);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .requiresVerification(false)
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request, String userAgent, String ipAddress) {
        String refreshToken = request.getRefreshToken();
        
        // Active device checks
        UserSession session = userSessionRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or revoked refresh token"));

        String userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            if (jwtService.isTokenValid(refreshToken, user)) {
                String newAccessToken = jwtService.generateToken(user);
                String newRefreshToken = jwtService.generateRefreshToken(user);

                // Update session
                session.setRefreshToken(newRefreshToken);
                session.setLastActiveAt(LocalDateTime.now());
                session.setUserAgent(userAgent);
                session.setIpAddress(ipAddress);
                userSessionRepository.save(session);

                return AuthResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(newRefreshToken)
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole().name())
                        .requiresVerification(false)
                        .build();
            }
        }
        throw new IllegalArgumentException("Invalid refresh token");
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with this email does not exist"));

        String resetOtp = generateOtp();
        user.setResetOtpCode(resetOtp);
        user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetOtp);

        AuditLog audit = AuditLog.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .action("PASSWORD_RESET_REQUESTED")
                .build();
        auditLogRepository.save(audit);
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getResetOtpCode() == null || !user.getResetOtpCode().equals(request.getOtpCode())) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        if (user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        // Reset password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetOtpCode(null);
        user.setResetOtpExpiry(null);
        userRepository.save(user);

        AuditLog audit = AuditLog.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .action("PASSWORD_RESET_SUCCESS")
                .build();
        auditLogRepository.save(audit);
    }

    public AuthResponse loginWithGoogle(GoogleLoginRequest request, String userAgent, String ipAddress) {
        String idToken = request.getIdToken();
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        
        java.util.Map<String, Object> payload;
        try {
            payload = restTemplate.getForObject(url, java.util.Map.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to verify Google ID token with identity providers: " + e.getMessage());
        }
        
        if (payload == null || payload.containsKey("error_description")) {
            throw new IllegalArgumentException("Invalid Google ID token signature or expired session");
        }
        
        String email = (String) payload.get("email");
        String name = (String) payload.get("name");
        
        if (email == null) {
            throw new IllegalArgumentException("Google ID token does not contain email claim");
        }

        java.util.Optional<User> userOpt = userRepository.findByEmail(email);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            // Auto register Google user
            user = User.builder()
                    .name(name != null ? name : "Google User")
                    .email(email)
                    .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString())) // random long password
                    .role(Role.USER)
                    .enabled(true) // already verified via Google
                    .build();
            user = userRepository.save(user);

            AuditLog regAudit = AuditLog.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .action("GOOGLE_REGISTER")
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build();
            auditLogRepository.save(regAudit);
        }

        // Check suspicious login
        checkSuspiciousLogin(user, ipAddress, userAgent);

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        registerSession(user, refreshToken, userAgent, ipAddress);
        AuditLog audit = AuditLog.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .action("GOOGLE_LOGIN_SUCCESS")
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        auditLogRepository.save(audit);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .requiresVerification(false)
                .build();
    }

    public MfaSetupResponse setupMfa(User user) {
        String secret = totpService.generateSecretKey();
        user.setMfaSecret(secret);
        userRepository.save(user);
        
        String qrCodeUrl = totpService.getQrCodeUrl(user.getEmail(), secret);
        return MfaSetupResponse.builder()
                .secret(secret)
                .qrCodeUrl(qrCodeUrl)
                .build();
    }

    public void enableMfa(User user, String code) {
        if (user.getMfaSecret() == null) {
            throw new IllegalArgumentException("MFA is not set up yet");
        }
        if (!totpService.verifyCode(user.getMfaSecret(), code)) {
            throw new IllegalArgumentException("Invalid verification code");
        }
        user.setMfaEnabled(true);
        userRepository.save(user);

        AuditLog audit = AuditLog.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .action("MFA_ENABLED")
                .build();
        auditLogRepository.save(audit);
    }

    public void disableMfa(User user) {
        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        userRepository.save(user);

        AuditLog audit = AuditLog.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .action("MFA_DISABLED")
                .build();
        auditLogRepository.save(audit);
    }

    public AuthResponse verifyMfa(MfaVerifyRequest request, String userAgent, String ipAddress) {
        String mfaToken = request.getMfaToken();
        if (!jwtService.isMfaPending(mfaToken)) {
            throw new IllegalArgumentException("Invalid or expired MFA token");
        }
        String email = jwtService.extractUsername(mfaToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!totpService.verifyCode(user.getMfaSecret(), request.getCode())) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        // Check suspicious login
        checkSuspiciousLogin(user, ipAddress, userAgent);

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        registerSession(user, refreshToken, userAgent, ipAddress);
        AuditLog audit = AuditLog.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .action("MFA_VERIFIED_LOGIN")
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        auditLogRepository.save(audit);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .requiresVerification(false)
                .build();
    }

    public List<UserSessionResponse> getSessions(User user) {
        List<UserSession> sessions = userSessionRepository.findByUserId(user.getId());
        return sessions.stream()
                .map(s -> UserSessionResponse.builder()
                        .id(s.getId())
                        .ipAddress(s.getIpAddress())
                        .userAgent(s.getUserAgent())
                        .lastActiveAt(s.getLastActiveAt())
                        .build())
                .collect(Collectors.toList());
    }

    public void revokeSession(User user, Long sessionId) {
        UserSession session = userSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        if (!session.getUserId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized session revocation");
        }
        userSessionRepository.delete(session);

        AuditLog audit = AuditLog.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .action("SESSION_REVOKED")
                .ipAddress(session.getIpAddress())
                .userAgent(session.getUserAgent())
                .build();
        auditLogRepository.save(audit);
    }

    public List<AuditLogResponse> getAuditLogs(User user) {
        List<AuditLog> logs = auditLogRepository.findByUserIdOrderByTimestampDesc(user.getId());
        return logs.stream()
                .map(l -> AuditLogResponse.builder()
                        .id(l.getId())
                        .action(l.getAction())
                        .ipAddress(l.getIpAddress())
                        .userAgent(l.getUserAgent())
                        .timestamp(l.getTimestamp())
                        .build())
                .collect(Collectors.toList());
    }

    public void logFailedLogin(String email, String ipAddress, String userAgent) {
        AuditLog audit = AuditLog.builder()
                .email(email)
                .action("LOGIN_FAILED")
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        auditLogRepository.save(audit);

        LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);
        List<AuditLog> failedLogs = auditLogRepository.findByEmailOrderByTimestampDesc(email);
        long count = failedLogs.stream()
                .filter(l -> "LOGIN_FAILED".equals(l.getAction()))
                .filter(l -> l.getTimestamp().isAfter(fifteenMinutesAgo))
                .count();

        if (count >= 3) {
            userRepository.findByEmail(email).ifPresent(user -> {
                emailService.sendFailedLoginAlertEmail(user.getEmail(), user.getName(), (int) count);
            });
        }
    }

    private void checkSuspiciousLogin(User user, String ipAddress, String userAgent) {
        List<AuditLog> previousLogins = auditLogRepository.findByEmailOrderByTimestampDesc(user.getEmail());
        boolean knownConnection = previousLogins.stream()
                .filter(l -> "LOGIN_SUCCESS".equals(l.getAction()) || "REGISTER_OTP_VERIFIED".equals(l.getAction()) || "MFA_VERIFIED_LOGIN".equals(l.getAction()))
                .anyMatch(l -> ipAddress.equals(l.getIpAddress()) && userAgent.equals(l.getUserAgent()));

        if (!knownConnection && !previousLogins.isEmpty()) {
            emailService.sendSuspiciousLoginEmail(user.getEmail(), user.getName(), ipAddress, userAgent);
        }
    }

    private void registerSession(User user, String refreshToken, String userAgent, String ipAddress) {
        UserSession session = UserSession.builder()
                .userId(user.getId())
                .refreshToken(refreshToken)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .build();
        userSessionRepository.save(session);
    }

    public void deleteSessionByToken(String refreshToken) {
        userSessionRepository.deleteByRefreshToken(refreshToken);
    }

    private String generateOtp() {
        return String.valueOf((int) (Math.random() * 900000) + 100000);
    }
}
