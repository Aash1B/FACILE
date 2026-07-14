package com.facile.order_cart_service.order;

import com.facile.order_cart_service.cart.Cart;
import com.facile.order_cart_service.cart.CartItem;
import com.facile.order_cart_service.cart.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;

    public Order checkout(String userId, String shippingAddress) {
        Cart cart = cartService.getCartByUserId(userId);

        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot checkout an empty cart");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem(
                    cartItem.getProductId(),
                    cartItem.getProductName(),
                    cartItem.getPrice(),
                    cartItem.getQuantity()
            );
            orderItems.add(orderItem);
        }

        Order order = new Order();
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