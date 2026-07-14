package com.facile.auth_user_service.service;

import com.facile.auth_user_service.dto.*;
import com.facile.auth_user_service.model.Role;
import com.facile.auth_user_service.model.User;
import com.facile.auth_user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

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

    public AuthResponse verifyOtp(VerifyOtpRequest request) {
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

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .requiresVerification(false)
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String userEmail = jwtService.extractUsername(refreshToken);

        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            if (jwtService.isTokenValid(refreshToken, user)) {
                String newAccessToken = jwtService.generateToken(user);
                String newRefreshToken = jwtService.generateRefreshToken(user);

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

    private String generateOtp() {
        return String.valueOf((int) (Math.random() * 900000) + 100000);
    }
}
