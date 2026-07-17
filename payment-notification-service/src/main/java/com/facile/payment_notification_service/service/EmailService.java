package com.facile.payment_notification_service.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username:}")
    private String mailUsername;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.password:}")
    private String mailPassword;

    @jakarta.annotation.PostConstruct
    public void init() {
        log.info("[SMTP CONFIG CHECK] Username resolved to: '{}', Password length: {}", 
            mailUsername, 
            mailPassword != null ? mailPassword.length() : 0
        );
    }

    public void sendPaymentSuccessEmail(String toEmail, String orderId, String paymentId, double amount) {
        // Log to terminal for local debugging
        System.out.println("\n==================================================");
        System.out.println("[DEVELOPER EMAIL ALERT] Payment Confirmation to: " + toEmail);
        System.out.println("Order ID:   " + orderId);
        System.out.println("Payment ID: " + paymentId);
        System.out.println("Amount:     ₹" + amount);
        System.out.println("==================================================\n");

        if (toEmail == null || toEmail.isBlank() || !toEmail.contains("@")) {
            log.warn("Invalid or missing user email. Skipping email dispatch.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Payment Confirmed - Facile Order Confirmation");

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Payment Confirmed</title>
                    <style>
                        body { background-color: #F4F4F0; font-family: sans-serif; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid rgba(74, 85, 104, 0.1); }
                        .header { background-color: #4A5568; padding: 30px; text-align: center; }
                        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; }
                        .content { padding: 40px; text-align: center; color: #2D3748; }
                        .content h2 { font-size: 22px; margin-top: 0; font-weight: 600; color: #4A5568; }
                        .receipt-details { background-color: #F7FAFC; border-radius: 12px; border: 1px solid #E2E8F0; padding: 20px; margin: 25px 0; text-align: left; }
                        .receipt-details p { margin: 8px 0; font-size: 14px; }
                        .footer { background-color: #EDF2F7; padding: 20px; text-align: center; font-size: 12px; color: #718096; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>FACILE</h1>
                        </div>
                        <div class="content">
                            <h2>Your Payment Was Successful!</h2>
                            <p>Thank you for your order. We have verified your payment details, and your order is now processing.</p>
                            <div class="receipt-details">
                                <p><strong>Order ID:</strong> %s</p>
                                <p><strong>Payment ID:</strong> %s</p>
                                <p><strong>Amount Paid:</strong> ₹%s</p>
                                <p><strong>Status:</strong> SUCCESS</p>
                            </div>
                            <p>If you have any questions, please contact our support team.</p>
                        </div>
                        <div class="footer">
                            &copy; 2026 Facile Inc. All rights reserved.
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(orderId, paymentId, amount);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Payment success email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send payment confirmation email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendGiftCardEmail(String toEmail, String code, String pin, BigDecimal amount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("Your Facile Gift Card");
            helper.setText("<h2>Your Facile Gift Card</h2><p>Value: ₹" + amount + "</p><p>Card number: <b>" + code + "</b></p><p>PIN: <b>" + pin + "</b></p><p>Keep these details private. Add the card from your Facile profile.</p>", true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to email gift card to {}: {}", toEmail, e.getMessage());
        }
    }
}
