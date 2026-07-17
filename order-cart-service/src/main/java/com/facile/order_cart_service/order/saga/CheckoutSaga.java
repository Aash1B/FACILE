package com.facile.order_cart_service.order.saga;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "checkout_sagas")
public class CheckoutSaga {

    @Id
    private String id;
    
    private String correlationId;
    
    private String userId;
    
    private String idempotencyKey;

    private String razorpayOrderId;
    private String razorpayPaymentId;
    
    private String internalOrderId;
    
    private SagaState state;
    
    private boolean paymentCompleted;
    private boolean orderCreated;
    private boolean inventoryReduced;
    private boolean notificationSent;
    
    private String failureReason;
    
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime compensationStartedAt;
    private LocalDateTime compensationCompletedAt;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<Map<String, Object>> reducedInventoryItems;
}
