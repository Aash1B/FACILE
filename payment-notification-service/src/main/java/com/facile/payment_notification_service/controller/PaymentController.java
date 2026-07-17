package com.facile.payment_notification_service.controller;

import com.facile.payment_notification_service.dto.PaymentVerifyRequest;
import com.facile.payment_notification_service.dto.PaymentVerifyResponse;
import com.facile.payment_notification_service.service.PaymentService;
import com.facile.payment_notification_service.service.GiftCardService;
import com.facile.payment_notification_service.dto.GiftCardRedeemRequest;
import com.facile.payment_notification_service.dto.WalletPaymentRequest;
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
    private final GiftCardService giftCardService;

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

    // POST /payments/refund (Compensation API)
    @PostMapping("/refund")
    public ResponseEntity<?> refundPayment(@RequestBody Map<String, String> payload) {
        try {
            String paymentId = payload.get("paymentId");
            boolean success = paymentService.refundPayment(paymentId);
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Refund processed"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Refund failed"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Internal error during refund."));
        }
    }

    @GetMapping("/wallet")
    public ResponseEntity<?> wallet(@RequestParam String email) {
        return ResponseEntity.ok(Map.of("balance", giftCardService.balance(email)));
    }

    @PostMapping("/gift-cards/redeem")
    public ResponseEntity<?> redeem(@RequestBody GiftCardRedeemRequest request) {
        try { return ResponseEntity.ok(giftCardService.redeem(request.getEmail(), request.getCode(), request.getPin())); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @PostMapping("/wallet/pay")
    public ResponseEntity<?> payWithWallet(@RequestBody WalletPaymentRequest request) {
        try { return ResponseEntity.ok(Map.of("balance", giftCardService.pay(request.getEmail(), request.getAmount()))); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }
}
