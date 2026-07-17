package com.facile.order_cart_service.order;

import lombok.Data;

import java.util.List;

@Data
public class DirectCheckoutRequest {
    private String shippingAddress;
    private List<OrderItem> items;
}
