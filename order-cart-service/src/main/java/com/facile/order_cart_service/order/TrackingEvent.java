package com.facile.order_cart_service.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackingEvent {
    private String status;
    private String message;
    private LocalDateTime occurredAt;
    private boolean completed;
}
