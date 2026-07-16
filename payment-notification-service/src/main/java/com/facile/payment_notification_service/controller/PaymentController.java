package com.facile.payment_notification_service.controller;

import com.facile.payment_notification_service.dto.PaymentVerifyRequest;
import com.facile.payment_notification_service.dto.PaymentVerifyResponse;
import com.facile.payment_notification_service.service.PaymentService;
import com.razorpay.Order;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // POST /payments/create-order  (existing — unchanged)
    @PostMapping("/create-order")
    public ResponseEntity<String> createOrder(@RequestParam double amount) {
        try {
            Order order = paymentService.createOrder(amount);
            return ResponseEntity.ok(order.toJson().toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /payments/verify  (new)
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@Valid @RequestBody PaymentVerifyRequest request) {
        try {
            PaymentVerifyResponse response = paymentService.verifyAndSave(request);
            return ResponseEntity.ok(response);
        } catch (PaymentService.SignatureVerificationException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Internal error during payment verification."));
        }
    }

    // GET /payments/history
    @GetMapping("/history")
    public ResponseEntity<?> getPaymentHistory(@RequestParam String userId) {
        try {
            java.util.List<com.facile.payment_notification_service.entity.Payment> history = paymentService.getPaymentHistory(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Failed to retrieve payment history."));
        }
    }
}
