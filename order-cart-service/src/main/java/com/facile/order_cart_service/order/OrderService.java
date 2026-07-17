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
}
