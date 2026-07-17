package com.facile.order_cart_service.order.saga;

public enum SagaState {
    STARTED,
    PAYMENT_COMPLETED,
    ORDER_CREATED,
    INVENTORY_UPDATED,
    NOTIFICATION_SENT,
    COMPLETED,
    FAILED,
    COMPENSATED
}
