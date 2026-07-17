package com.facile.order_cart_service.order.saga.exception;

public class OrderCreationException extends RuntimeException {
    public OrderCreationException(String message) {
        super(message);
    }
    public OrderCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}
