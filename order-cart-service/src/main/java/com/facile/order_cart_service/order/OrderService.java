package com.facile.order_cart_service.order;

import com.facile.order_cart_service.cart.Cart;
import com.facile.order_cart_service.cart.CartItem;
import com.facile.order_cart_service.cart.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;

    public synchronized Order checkout(String userId, String shippingAddress, String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("Idempotency-Key header is required");
        }
        Order existingOrder = orderRepository.findByIdempotencyKey(idempotencyKey).orElse(null);
        if (existingOrder != null) {
            return existingOrder;
        }
        if (shippingAddress == null || shippingAddress.isBlank()) {
            throw new IllegalArgumentException("Shipping address is required");
        }

        Cart cart = cartService.getCartByUserId(userId);

        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot checkout an empty cart");
        }

        // Deduct stock from product-inventory-service
        List<Map<String, Object>> itemsToReduce = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            Map<String, Object> reduceItem = new HashMap<>();
            String rawId = cartItem.getProductId();
            long parsedId = Long.parseLong(rawId.replaceAll("\\D+", ""));
            reduceItem.put("productId", parsedId);
            reduceItem.put("quantity", cartItem.getQuantity());
            itemsToReduce.add(reduceItem);
        }
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("items", itemsToReduce);
        
        RestTemplate restTemplate = new RestTemplate();
        try {
            restTemplate.postForEntity(
                "http://localhost:8083/api/products/inventory/reduce", 
                requestBody, 
                String.class
            );
        } catch (org.springframework.web.client.HttpClientErrorException.BadRequest e) {
            throw new IllegalStateException("Stock reduction failed: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new IllegalStateException("Product & Inventory service communication error: " + e.getMessage());
        }

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem(
                    cartItem.getProductId(),
                    cartItem.getProductName(),
                    cartItem.getImage(),
                    cartItem.getPrice(),
                    cartItem.getQuantity()
            );
            orderItems.add(orderItem);
        }

        Order order = new Order();
        order.setIdempotencyKey(idempotencyKey);
        order.setUserId(userId);
        order.setItems(orderItems);
        order.setTotalAmount(cart.getTotalAmount());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setShippingAddress(shippingAddress);

        Order savedOrder = orderRepository.save(order);

        cartService.clearCart(userId);

        return savedOrder;
    }

    public List<Order> getOrderHistory(String userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order getOrderById(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
    }

    public Order updateOrderStatus(String orderId, OrderStatus newStatus) {
        Order order = getOrderById(orderId);
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
}
