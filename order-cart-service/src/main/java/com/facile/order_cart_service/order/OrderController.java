package com.facile.order_cart_service.order;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/{userId}/checkout")
    public Order checkout(
            @PathVariable String userId,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @RequestBody Map<String, String> body) {
        String shippingAddress = body.get("shippingAddress");
        return orderService.checkout(userId, shippingAddress, idempotencyKey);
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
}
