package com.facile.order_cart_service.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    @Indexed(unique = true, sparse = true)
    private String idempotencyKey;

    private String userId;

    private List<OrderItem> items;

    private double totalAmount;

    private OrderStatus status;

    private LocalDateTime createdAt;

    private String shippingAddress;
}
