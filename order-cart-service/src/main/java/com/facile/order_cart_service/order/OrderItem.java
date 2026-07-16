package com.facile.order_cart_service.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    private String productId;

    private String productName;

    private String image;

    private double price;

    private int quantity;
}
