package com.facile.order_cart_service.order.saga.exception;

public class InventoryException extends RuntimeException {
    public InventoryException(String message) {
        super(message);
    }
    public InventoryException(String message, Throwable cause) {
        super(message, cause);
    }
}
