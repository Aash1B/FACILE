package com.facile.auth_user_service.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final BrevoMailClient brevoMailClient;

    @Value("${application.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public void sendOtpEmail(String toEmail, String name, String otpCode) {
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Verify Your Facile Account</title>
                <style>
                    body {
                        background-color: #F4E6C7;
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        -webkit-font-smoothing: antialiased;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                        border: 1px solid rgba(165, 142, 116, 0.15);
                    }
                    .header {
                        background-color: #424530;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        color: #F4E6C7;
                        margin: 0;
                        font-size: 28px;
                        font-weight: 300;
                        letter-spacing: 2px;
                    }
                    .content {
                        padding: 40px;
                        text-align: center;
                        color: #424530;
                    }
                    .content h2 {
                        font-size: 22px;
                        margin-top: 0;
                        font-weight: 600;
                    }
                    .content p {
                        font-size: 15px;
                        line-height: 1.6;
                        color: #555555;
                        margin-bottom: 30px;
                    }
                    .otp-box {
                        background-color: #F4E6C7;
                        border: 2px dashed #E09132;
                        border-radius: 12px;
                        display: inline-block;
                        padding: 15px 40px;
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #E09132;
                        margin: 20px 0;
                    }
                    .footer {
                        background-color: #FAF6EE;
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #A58E74;
                        border-top: 1px solid rgba(165, 142, 116, 0.1);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>FACILE</h1>
                    </div>
                    <div class="content">
                        <h2>Email Verification Required</h2>
                        <p>Hello %s,</p>
                        <p>Thank you for creating an account with Facile. To complete your registration and secure your profile, please enter the One-Time Password (OTP) code below on the verification screen.</p>
                        <div class="otp-box">%s</div>
                        <p>This code is valid for <strong>5 minutes</strong>. If you did not request this verification, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        &copy; 2026 Facile Inc. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, otpCode);

        brevoMailClient.send(toEmail, "Verify Your Facile Account", htmlContent);
        log.info("OTP email accepted by Brevo for recipient {}", toEmail);
    }

    public void sendPasswordResetEmail(String toEmail, String name, String resetToken) {
        String resetUrl = frontendUrl + "/forgot-password?token="
                + URLEncoder.encode(resetToken, StandardCharsets.UTF_8);
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Reset Your Facile Account Password</title>
                <style>
                    body { background-color: #F4E6C7; font-family: sans-serif; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid rgba(165, 142, 116, 0.15); }
                    .header { background-color: #424530; padding: 30px; text-align: center; }
                    .header h1 { color: #F4E6C7; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; }
                    .content { padding: 40px; text-align: center; color: #424530; }
                    .content h2 { font-size: 22px; margin-top: 0; font-weight: 600; }
                    .content p { font-size: 15px; line-height: 1.6; color: #555555; margin-bottom: 30px; }
                    .footer { background-color: #FAF6EE; padding: 20px; text-align: center; font-size: 12px; color: #A58E74; border-top: 1px solid rgba(165, 142, 116, 0.1); }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>FACILE</h1>
                    </div>
                    <div class="content">
                        <h2>Password Reset Request</h2>
                        <p>Hello %s,</p>
                        <p>We received a request to reset your password. Click the secure link below to choose a new password.</p>
                        <p><a href="%s" style="display:inline-block;background:#424530;color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:bold">Reset my password</a></p>
                        <p>This one-time link is valid for <strong>15 minutes</strong>. If you did not request it, ignore this email.</p>
                    </div>
                    <div class="footer">
                        &copy; 2026 Facile Inc. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, resetUrl);

        brevoMailClient.send(toEmail, "Reset Your Facile Account Password", htmlContent);
        log.info("Password reset email accepted by Brevo for recipient {}", toEmail);
    }

    public void sendSuspiciousLoginEmail(String toEmail, String name, String ipAddress, String userAgent) {
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Suspicious Login Alert</title>
                <style>
                    body { background-color: #F4E6C7; font-family: sans-serif; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid rgba(165, 142, 116, 0.15); }
                    .header { background-color: #E09132; padding: 30px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; }
                    .content { padding: 40px; text-align: left; color: #424530; }
                    .content h2 { font-size: 22px; margin-top: 0; font-weight: 600; color: #E09132; }
                    .content p { font-size: 15px; line-height: 1.6; color: #555555; }
                    .details-box { background-color: #FAF6EE; border: 1px solid rgba(165, 142, 116, 0.2); border-radius: 12px; padding: 20px; margin: 20px 0; }
                    .details-box p { margin: 5px 0; font-size: 14px; color: #424530; }
                    .footer { background-color: #FAF6EE; padding: 20px; text-align: center; font-size: 12px; color: #A58E74; border-top: 1px solid rgba(165, 142, 116, 0.1); }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>SECURITY ALERT</h1>
                    </div>
                    <div class="content">
                        <h2>New Device/Location Login Detected</h2>
                        <p>Hello %s,</p>
                        <p>We detected a new login to your Facile account from a device or location we don't recognize:</p>
                        <div class="details-box">
                            <p><strong>IP Address:</strong> %s</p>
                            <p><strong>Device Info:</strong> %s</p>
                            <p><strong>Time:</strong> %s</p>
                        </div>
                        <p>If this was you, you can safely ignore this email. If this wasn't you, please change your password immediately to secure your account.</p>
                    </div>
                    <div class="footer">
                        &copy; 2026 Facile Inc. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, ipAddress, userAgent, java.time.LocalDateTime.now());

        sendSecurityAlert(toEmail, "Suspicious Login Alert - Facile", htmlContent);
    }

    public void sendFailedLoginAlertEmail(String toEmail, String name, int attempts) {
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Failed Login Alert</title>
                <style>
                    body { background-color: #F4E6C7; font-family: sans-serif; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid rgba(165, 142, 116, 0.15); }
                    .header { background-color: #E09132; padding: 30px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; }
                    .content { padding: 40px; text-align: left; color: #424530; }
                    .content h2 { font-size: 22px; margin-top: 0; font-weight: 600; color: #E09132; }
                    .content p { font-size: 15px; line-height: 1.6; color: #555555; }
                    .footer { background-color: #FAF6EE; padding: 20px; text-align: center; font-size: 12px; color: #A58E74; border-top: 1px solid rgba(165, 142, 116, 0.1); }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>SECURITY NOTICE</h1>
                    </div>
                    <div class="content">
                        <h2>Failed Login Alert</h2>
                        <p>Hello %s,</p>
                        <p>We detected %d failed login attempts on your account in a short period of time.</p>
                        <p>If this was you, please make sure your password is correct. If this wasn't you, please change your password or verify that your account is safe.</p>
                    </div>
                    <div class="footer">
                        &copy; 2026 Facile Inc. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, attempts);

        sendSecurityAlert(toEmail, "Multiple Failed Login Attempts Detected", htmlContent);
    }

    private void sendSecurityAlert(String toEmail, String subject, String htmlContent) {
        try {
            brevoMailClient.send(toEmail, subject, htmlContent);
            log.info("Security alert email accepted by Brevo for recipient {}", toEmail);
        } catch (EmailDeliveryException exception) {
            log.warn("Security alert email delivery failed for recipient {}: {}", toEmail, exception.getMessage());
        }
    }
}
