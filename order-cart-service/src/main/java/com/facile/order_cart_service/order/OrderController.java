package com.facile.order_cart_service.order;

import com.facile.order_cart_service.order.saga.CheckoutSagaOrchestrator;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final CheckoutSagaOrchestrator sagaOrchestrator;

    @PostMapping("/{userId}/checkout")
    public Order checkout(
            @PathVariable String userId,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @RequestBody Map<String, String> body) {
        String shippingAddress = body.get("shippingAddress");
        return orderService.checkout(userId, shippingAddress, idempotencyKey);
    }

    @PostMapping("/{userId}/checkout-direct")
    public Order checkoutDirect(
            @PathVariable String userId,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @RequestBody DirectCheckoutRequest request) {
        return orderService.checkoutDirect(userId, request.getShippingAddress(), request.getItems(), idempotencyKey);
    }

    @GetMapping("/{userId}")
    public List<Order> getOrderHistory(@PathVariable String userId) {
        return orderService.getOrderHistory(userId);
    }

    @GetMapping("/review-eligibility")
    public Map<String, Boolean> getReviewEligibility(
            @RequestParam String userId,
            @RequestParam String productId) {
        return Map.of("eligible", orderService.hasPurchasedProduct(userId, productId));
    }

    @GetMapping("/detail/{orderId}")
    public Order getOrderById(@PathVariable String orderId) {
        return orderService.getOrderById(orderId);
    }

    @PatchMapping("/{orderId}/status")
    public Order updateOrderStatus(@PathVariable String orderId, @RequestBody Map<String, String> body) {
        OrderStatus newStatus = OrderStatus.valueOf(body.get("status"));
        return orderService.updateOrderStatus(orderId, newStatus);
    }

    @PostMapping("/{userId}/saga/checkout")
    public com.facile.order_cart_service.order.saga.CheckoutSaga sagaCheckout(
            @PathVariable String userId,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @RequestBody Map<String, Object> body) {
        
        String shippingAddress = (String) body.get("shippingAddress");
        String razorpayOrderId = (String) body.get("razorpay_order_id");
        String razorpayPaymentId = (String) body.get("razorpay_payment_id");
        String razorpaySignature = (String) body.get("razorpay_signature");
        double amount = Double.parseDouble(body.get("amount").toString());

        return sagaOrchestrator.startCheckoutSaga(
                userId,
                shippingAddress,
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
                amount,
                idempotencyKey
        );
    }

    @PostMapping("/cancel")
    public java.util.Map<String, Object> cancelOrder(@RequestBody Map<String, String> body) {
        String orderId = body.get("orderId");
        orderService.cancelOrder(orderId);
        return Map.of("success", true, "message", "Order cancelled");
    }

    @GetMapping("/saga/{sagaId}")
    public org.springframework.http.ResponseEntity<?> getSagaStatus(@PathVariable String sagaId) {
        try {
            com.facile.order_cart_service.order.saga.CheckoutSaga saga = sagaOrchestrator.getSagaByCorrelationId(sagaId);
            return org.springframework.http.ResponseEntity.ok(saga);
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
