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
import java.util.LinkedHashMap;

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

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            orderItems.add(new OrderItem(
                    cartItem.getProductId(), cartItem.getProductName(), cartItem.getImage(),
                    cartItem.getPrice(), cartItem.getQuantity()));
        }

        reduceInventory(orderItems);

        Order savedOrder = saveOrder(userId, shippingAddress, idempotencyKey, orderItems, cart.getTotalAmount());
        cartService.clearCart(userId);
        return savedOrder;
    }

    public synchronized Order checkoutDirect(String userId, String shippingAddress, List<OrderItem> items,
                                             String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("Idempotency-Key header is required");
        }
        Order existingOrder = orderRepository.findByIdempotencyKey(idempotencyKey).orElse(null);
        if (existingOrder != null) return existingOrder;
        if (shippingAddress == null || shippingAddress.isBlank()) {
            throw new IllegalArgumentException("Shipping address is required");
        }
        if (items == null || items.isEmpty()) {
            throw new IllegalStateException("Cannot checkout without products");
        }

        reduceInventory(items);
        double total = items.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
        return saveOrder(userId, shippingAddress, idempotencyKey, items, total);
    }

    private void reduceInventory(List<OrderItem> orderItems) {
        List<Map<String, Object>> itemsToReduce = new ArrayList<>();
        for (OrderItem orderItem : orderItems) {
            Map<String, Object> reduceItem = new HashMap<>();
            String rawId = orderItem.getProductId();
            long parsedId = Long.parseLong(rawId.replaceAll("\\D+", ""));
            reduceItem.put("productId", parsedId);
            reduceItem.put("quantity", orderItem.getQuantity());
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
    }

    private Order saveOrder(String userId, String shippingAddress, String idempotencyKey,
                            List<OrderItem> orderItems, double totalAmount) {
        Order order = new Order();
        order.setIdempotencyKey(idempotencyKey);
        order.setUserId(userId);
        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setShippingAddress(shippingAddress);

        return orderRepository.save(order);
    }

    public List<Order> getOrderHistory(String userId) {
        return orderRepository.findByUserId(userId);
    }

    public boolean hasPurchasedProduct(String userId, String productId) {
        String normalizedProductId = productId.replaceAll("\\D+", "");
        return orderRepository.findByUserId(userId).stream()
                .filter(order -> order.getStatus() != OrderStatus.CANCELLED)
                .flatMap(order -> order.getItems().stream())
                .map(OrderItem::getProductId)
                .filter(java.util.Objects::nonNull)
                .map(id -> id.replaceAll("\\D+", ""))
                .anyMatch(normalizedProductId::equals);
    }

    public Order getOrderById(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
    }

    public synchronized Order createOrderForSaga(String userId, String shippingAddress, String idempotencyKey) {
        Order existingOrder = orderRepository.findByIdempotencyKey(idempotencyKey).orElse(null);
        if (existingOrder != null) {
            return existingOrder;
        }

        Cart cart = cartService.getCartByUserId(userId);
        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot checkout an empty cart");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            orderItems.add(new OrderItem(
                    cartItem.getProductId(),
                    cartItem.getProductName(),
                    cartItem.getImage(),
                    cartItem.getPrice(),
                    cartItem.getQuantity()
            ));
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

    public void cancelOrder(String orderId) {
        Order order = getOrderById(orderId);
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    public Order updateOrderStatus(String orderId, OrderStatus newStatus) {
        Order order = getOrderById(orderId);
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    public Map<String, Object> requestTracking(String orderId, String userId) {
        Order order = getOrderById(orderId);
        if (userId == null || userId.isBlank() || !userId.equalsIgnoreCase(order.getUserId())) {
            throw new IllegalArgumentException("This order does not belong to the signed-in user");
        }

        List<TrackingEvent> history = buildTrackingHistory(order);
        order.setTrackingHistory(history);
        order.setTrackingRequestedAt(LocalDateTime.now());
        orderRepository.save(order);

        boolean emailSent = false;
        try {
            Map<String, Object> notification = new LinkedHashMap<>();
            notification.put("email", userId);
            notification.put("orderId", order.getId());
            notification.put("status", order.getStatus().name());
            notification.put("history", history);
            new RestTemplate().postForEntity(
                    "http://localhost:8084/notifications/tracking",
                    notification,
                    Map.class
            );
            emailSent = true;
        } catch (Exception exception) {
            System.err.println("[Order Tracking] Email delivery failed: " + exception.getMessage());
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("order", order);
        response.put("history", history);
        response.put("emailSent", emailSent);
        response.put("message", emailSent
                ? "Tracking history was emailed successfully."
                : "Tracking is available, but the email service is currently unavailable.");
        return response;
    }

    private List<TrackingEvent> buildTrackingHistory(Order order) {
        LocalDateTime created = order.getCreatedAt() == null ? LocalDateTime.now() : order.getCreatedAt();
        OrderStatus current = order.getStatus() == null ? OrderStatus.PENDING : order.getStatus();
        List<TrackingEvent> events = new ArrayList<>();
        events.add(new TrackingEvent("PENDING", "Order placed and awaiting confirmation", created, true));

        if (current == OrderStatus.CANCELLED) {
            events.add(new TrackingEvent("CANCELLED", "Order was cancelled", created.plusHours(1), true));
            return events;
        }

        boolean confirmed = current == OrderStatus.CONFIRMED || current == OrderStatus.SHIPPED || current == OrderStatus.DELIVERED;
        boolean shipped = current == OrderStatus.SHIPPED || current == OrderStatus.DELIVERED;
        boolean delivered = current == OrderStatus.DELIVERED;
        events.add(new TrackingEvent("CONFIRMED", "Order confirmed and being prepared", confirmed ? created.plusHours(1) : null, confirmed));
        events.add(new TrackingEvent("SHIPPED", "Package handed to the delivery partner", shipped ? created.plusDays(1) : null, shipped));
        events.add(new TrackingEvent("DELIVERED", "Package delivered to the selected address", delivered ? created.plusDays(3) : null, delivered));
        return events;
    }
}
