package com.facile.order_cart_service.cart;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {

    private String productId;

    private String productName;

    private String image;

    private Integer maxOrderQuantity;

    private double price;

    private int quantity;
}
