package com.facile.order_cart_service.order.saga.exception;

public class SagaExecutionException extends RuntimeException {
    public SagaExecutionException(String message) {
        super(message);
    }
    public SagaExecutionException(String message, Throwable cause) {
        super(message, cause);
    }
}
