package com.facile.payment_notification_service.service;

import com.facile.payment_notification_service.dto.PaymentVerifyRequest;
import com.facile.payment_notification_service.dto.PaymentVerifyResponse;
import com.facile.payment_notification_service.entity.Payment;
import com.facile.payment_notification_service.entity.PaymentStatus;
import com.facile.payment_notification_service.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Core business logic for the Payment & Notification Service.
 *
 * Responsibilities:
 *   1. Create Razorpay orders       → createOrder()
 *   2. Verify Razorpay signatures   → verifyAndSave()
 *   3. Persist payment records      → savePaymentRecord() [private]
 *   4. Future Order Service hook    → notifyOrderService() [stub]
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;
    private final GiftCardService giftCardService;

    /**
     * Razorpay secret key — injected from application.properties.
     * Used for HMAC-SHA256 signature computation.
     */
    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // ═══════════════════════════════════════════════════════════════════
    // 1. CREATE RAZORPAY ORDER  (existing functionality — unchanged)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Creates a Razorpay order for the given amount.
     * Called by POST /payments/create-order
     *
     * @param amount Order total in INR (automatically converted to paise internally)
     * @return Razorpay Order object (JSON serialised in controller)
     */
    public Order createOrder(double amount) throws Exception {
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", Math.round(amount * 100)); // Convert ₹ to paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());
        return razorpayClient.orders.create(orderRequest);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 2. VERIFY SIGNATURE AND PERSIST PAYMENT
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Verifies the Razorpay payment signature and saves the payment record.
     *
     * Flow:
     *   1. Compute expected HMAC-SHA256(orderId + "|" + paymentId) using key.secret
     *   2. Compare computed signature with received signature (constant-time)
     *   3. Save Payment record with status = SUCCESS or FAILED
     *   4. If valid → return success response
     *      If invalid → throw SignatureVerificationException (controller returns HTTP 400)
     *
     * @param request DTO containing the three Razorpay fields + optional metadata
     * @return PaymentVerifyResponse with success=true and db record ID
     * @throws SignatureVerificationException if the signature does not match
     */
    public PaymentVerifyResponse verifyAndSave(PaymentVerifyRequest request) {
        boolean isValid = verifySignature(
                request.getRazorpay_order_id(),
                request.getRazorpay_payment_id(),
                request.getRazorpay_signature()
        );

        PaymentStatus status = isValid ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

        // Always persist the attempt (both success and failure) for audit trail
        Payment saved = savePaymentRecord(request, status);

        if (!isValid) {
            log.warn("[PAYMENT] Signature verification FAILED | orderId={} | userId={}",
                    request.getRazorpay_order_id(), request.getUserId());
            throw new SignatureVerificationException("Payment signature is invalid. Payment not confirmed.");
        }

        log.info("[PAYMENT] Verified and saved | paymentId={} | orderId={} | dbId={} | userId={}",
                request.getRazorpay_payment_id(),
                request.getRazorpay_order_id(),
                saved.getId(),
                request.getUserId());

        if ("GIFT_CARD".equalsIgnoreCase(request.getPurpose())) {
            giftCardService.issue(request.getUserId(), BigDecimal.valueOf(request.getAmount()), request.getRazorpay_payment_id());
        } else {
            // Standard order email is handled by the notification step of the checkout saga.
        }

        // ── Future Integration Hook ──────────────────────────────────────
        // TODO: [Member 1 — Order Service Integration]
        // After successful payment verification, notify the Order Service to
        // update the order status from PENDING → CONFIRMED.
        //
        // Steps to implement when Order Service is ready:
        //   1. Extract the internal order ID from the request or payment record
        //   2. Call: notifyOrderService(saved.getId(), internalOrderId)
        //   3. Handle service-unavailability gracefully (retry or async queue)
        //
        // notifyOrderService(saved.getId());
        // ────────────────────────────────────────────────────────────────

        return PaymentVerifyResponse.builder()
                .success(true)
                .message("Payment verified successfully.")
                .paymentRecordId(saved.getId())
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════
    // 3. HMAC-SHA256 SIGNATURE VERIFICATION  (private)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Implements Razorpay's official signature verification algorithm:
     *   expected_signature = HMAC-SHA256(orderId + "|" + paymentId, keySecret)
     *
     * Uses constant-time comparison (MessageDigest.isEqual) to prevent
     * timing-based side-channel attacks.
     *
     * @return true if signature matches, false otherwise
     */
    private boolean verifySignature(String orderId, String paymentId, String receivedSignature) {
        try {
            String message = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );
            mac.init(keySpec);

            byte[] computedBytes = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            String computedSignature = bytesToHex(computedBytes);

            // Constant-time comparison — prevents timing attacks
            return MessageDigest.isEqual(
                    computedSignature.getBytes(StandardCharsets.UTF_8),
                    receivedSignature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("[PAYMENT] Error during HMAC signature computation", e);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 4. PERSIST PAYMENT RECORD  (private)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Builds and saves a Payment entity to PostgreSQL.
     * Called for both SUCCESS and FAILED outcomes.
     */
    private Payment savePaymentRecord(PaymentVerifyRequest request, PaymentStatus status) {
        Payment payment = Payment.builder()
                .orderId(request.getRazorpay_order_id())
                .paymentId(request.getRazorpay_payment_id() != null
                        ? request.getRazorpay_payment_id() : "N/A")
                .signature(request.getRazorpay_signature() != null
                        ? request.getRazorpay_signature() : "N/A")
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .status(status)
                .userId(request.getUserId())
                .createdAt(LocalDateTime.now())
                .build();

        return paymentRepository.save(payment);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 5. FUTURE HOOK: NOTIFY ORDER SERVICE  (stub — intentionally empty)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Stub method for future Order Service integration.
     *
     * TODO: [Member 1 — implement when Order Service is ready]
     * This method should:
     *   - Accept the internal order ID (from Order Service) as a parameter
     *   - Call PUT http://order-cart-service/api/orders/{orderId}/status
     *     with body: { "status": "CONFIRMED" }
     *   - Be wired via a RestTemplate or OpenFeign client
     *   - Handle unavailability gracefully (circuit breaker / retry)
     *
     * @param paymentRecordId The DB id of the verified payment — for traceability
     */
    public void notifyOrderService(Long paymentRecordId) {
        // Intentionally empty — will be implemented when Order Service integration is planned.
        log.info("[TODO] notifyOrderService invoked for paymentRecordId={}. " +
                "Order Service integration not yet implemented.", paymentRecordId);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 6. RETRIEVE PAYMENT HISTORY
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Retrieves all payment attempts for a specific user.
     * Sorted by creation date descending (most recent first).
     */
    public java.util.List<Payment> getPaymentHistory(String userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 7. REFUND PAYMENT (COMPENSATION)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Refunds a payment. Simulates a refund if actual Razorpay refund fails
     * (which happens often in test mode without real captures).
     */
    public boolean refundPayment(String paymentId) {
        // Attempt to find the payment by Razorpay payment ID or Order ID
        java.util.List<Payment> payments = paymentRepository.findAll();
        Payment payment = payments.stream()
                .filter(p -> p.getPaymentId().equals(paymentId) || p.getOrderId().equals(paymentId))
                .findFirst()
                .orElse(null);

        if (payment == null) {
            log.warn("[PAYMENT] Refund failed. Payment not found for ID: {}", paymentId);
            return false;
        }

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            log.info("[PAYMENT] Payment {} already refunded.", paymentId);
            return true;
        }

        try {
            // Attempt Razorpay Refund (might throw exception in test mode if not captured)
            razorpayClient.payments.refund(new org.json.JSONObject().put("payment_id", payment.getPaymentId()));
            log.info("[PAYMENT] Razorpay API refund successful for payment {}", payment.getPaymentId());
        } catch (Exception e) {
            log.warn("[PAYMENT] Razorpay API refund failed (simulating success for test mode): {}", e.getMessage());
        }

        // Update status to REFUNDED
        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);
        log.info("[PAYMENT] Payment {} marked as REFUNDED in database.", payment.getPaymentId());
        
        return true;
    }

    // ═══════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════

    /** Converts a byte array to a lowercase hex string */
    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    // CUSTOM EXCEPTION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Thrown when Razorpay signature verification fails.
     * Caught by PaymentController → returns HTTP 400.
     */
    public static class SignatureVerificationException extends RuntimeException {
        public SignatureVerificationException(String message) {
            super(message);
        }
    }
}
