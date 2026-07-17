package com.facile.payment_notification_service.controller;

import com.facile.payment_notification_service.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestBody NotificationRequest request) {
        try {
            emailService.sendPaymentSuccessEmail(
                    request.getUserId(),
                    request.getOrderId(),
                    request.getPaymentId(),
                    request.getAmount()
            );
            return ResponseEntity.ok(Map.of("success", true, "message", "Notification sent"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Failed to send notification"));
        }
    }

    @Data
    public static class NotificationRequest {
        private String userId;
        private String orderId;
        private String paymentId;
        private double amount;
    }
}
