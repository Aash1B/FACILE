package com.facile.order_cart_service.order.saga;

import com.facile.order_cart_service.order.Order;
import com.facile.order_cart_service.order.OrderItem;
import com.facile.order_cart_service.order.OrderService;
import com.facile.order_cart_service.order.saga.exception.*;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckoutSagaOrchestrator {

    private final CheckoutSagaRepository sagaRepository;
    private final OrderService orderService;
    private final RestTemplate restTemplate;

    private final String PAYMENT_SERVICE_URL = "http://localhost:8084";
    private final String PRODUCT_SERVICE_URL = "http://localhost:8083";

    public CheckoutSaga startCheckoutSaga(
            String userId,
            String shippingAddress,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature,
            double amount,
            String idempotencyKey
    ) {
        String correlationId = UUID.randomUUID().toString();
        MDC.put("sagaId", correlationId);

        try {
            // Idempotency check
            CheckoutSaga existingSaga = sagaRepository.findByIdempotencyKey(idempotencyKey).orElse(null);
            if (existingSaga != null) {
                log.info("Saga already exists for idempotency key: {}", idempotencyKey);
                return existingSaga;
            }

            CheckoutSaga saga = CheckoutSaga.builder()
                    .correlationId(correlationId)
                    .userId(userId)
                    .idempotencyKey(idempotencyKey)
                    .razorpayOrderId(razorpayOrderId)
                    .razorpayPaymentId(razorpayPaymentId)
                    .state(SagaState.STARTED)
                    .startedAt(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            saga = sagaRepository.save(saga);

            log.info("Saga Started: {}", saga.getId());

            try {
                // STEP 1: Verify Payment
                log.info("Current Step: Verify Payment");
                verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature, userId, amount);
                saga.setPaymentCompleted(true);
                saga.setState(SagaState.PAYMENT_COMPLETED);
                saga.setUpdatedAt(LocalDateTime.now());
                sagaRepository.save(saga);
                log.info("Payment Successful for Saga: {}", saga.getId());

                // STEP 2: Create Order
                log.info("Current Step: Create Order");
                Order order = createOrderWithSaga(userId, shippingAddress, idempotencyKey);
                saga.setOrderCreated(true);
                saga.setInternalOrderId(order.getId());
                saga.setState(SagaState.ORDER_CREATED);
                saga.setUpdatedAt(LocalDateTime.now());
                sagaRepository.save(saga);
                log.info("Order Created for Saga: {}. OrderId: {}", saga.getId(), order.getId());

                // STEP 3: Reduce Inventory
                log.info("Current Step: Reduce Inventory");
                List<Map<String, Object>> itemsToReduce = prepareInventoryItems(order.getItems());
                saga.setReducedInventoryItems(itemsToReduce);
                reduceInventory(itemsToReduce);
                saga.setInventoryReduced(true);
                saga.setState(SagaState.INVENTORY_UPDATED);
                saga.setUpdatedAt(LocalDateTime.now());
                sagaRepository.save(saga);
                log.info("Inventory Reduced for Saga: {}", saga.getId());

                // STEP 4: Send Notification
                log.info("Current Step: Send Notification");
                sendNotification(userId, razorpayOrderId, razorpayPaymentId, amount);
                saga.setNotificationSent(true);
                saga.setState(SagaState.NOTIFICATION_SENT);
                
                // COMPLETE
                saga.setState(SagaState.COMPLETED);
                saga.setCompletedAt(LocalDateTime.now());
                saga.setUpdatedAt(LocalDateTime.now());
                sagaRepository.save(saga);
                log.info("Saga Completed: {}", saga.getId());

            } catch (Exception e) {
                log.error("Saga Failed: {}. Reason: {}", saga.getId(), e.getMessage());
                saga.setFailureReason(e.getMessage());
                saga.setState(SagaState.FAILED);
                saga.setUpdatedAt(LocalDateTime.now());
                sagaRepository.save(saga);
                
                executeCompensations(saga);
                throw new SagaExecutionException("Checkout failed: " + e.getMessage(), e);
            }

            return saga;
        } finally {
            MDC.remove("sagaId");
        }
    }

    private Order createOrderWithSaga(String userId, String shippingAddress, String idempotencyKey) {
        try {
            return orderService.createOrderForSaga(userId, shippingAddress, idempotencyKey);
        } catch (Exception e) {
            throw new OrderCreationException("Order creation failed: " + e.getMessage(), e);
        }
    }

    @Retry(name = "paymentService")
    @CircuitBreaker(name = "paymentService")
    private void verifyPayment(String orderId, String paymentId, String signature, String userId, double amount) {
        Map<String, Object> req = new HashMap<>();
        req.put("razorpay_order_id", orderId);
        req.put("razorpay_payment_id", paymentId);
        req.put("razorpay_signature", signature);
        req.put("userId", userId);
        req.put("amount", amount);
        req.put("currency", "INR");
        try {
            restTemplate.postForEntity(PAYMENT_SERVICE_URL + "/payments/verify", req, Map.class);
        } catch (Exception e) {
            throw new PaymentVerificationException("Payment verification failed: " + e.getMessage(), e);
        }
    }

    private List<Map<String, Object>> prepareInventoryItems(List<OrderItem> orderItems) {
        List<Map<String, Object>> items = new ArrayList<>();
        for (OrderItem item : orderItems) {
            String rawId = item.getProductId();
            long parsedId = Long.parseLong(rawId.replaceAll("\\D+", ""));
            Map<String, Object> reqItem = new HashMap<>();
            reqItem.put("productId", parsedId);
            reqItem.put("quantity", item.getQuantity());
            items.add(reqItem);
        }
        return items;
    }

    @Retry(name = "inventoryService")
    @CircuitBreaker(name = "inventoryService")
    private void reduceInventory(List<Map<String, Object>> items) {
        Map<String, Object> req = new HashMap<>();
        req.put("items", items);
        try {
            restTemplate.postForEntity(PRODUCT_SERVICE_URL + "/api/products/inventory/reduce", req, String.class);
        } catch (Exception e) {
            throw new InventoryException("Inventory reduction failed: " + e.getMessage(), e);
        }
    }

    @Retry(name = "paymentService")
    @CircuitBreaker(name = "paymentService")
    private void sendNotification(String userId, String orderId, String paymentId, double amount) {
        Map<String, Object> req = new HashMap<>();
        req.put("userId", userId);
        req.put("orderId", orderId);
        req.put("paymentId", paymentId);
        req.put("amount", amount);
        try {
            restTemplate.postForEntity(PAYMENT_SERVICE_URL + "/notifications/send", req, Map.class);
            log.info("Notification Sent for userId: {}", userId);
        } catch (Exception e) {
            log.error("Notification Failed for userId: {}. Saga continues.", userId);
        }
    }

    private void executeCompensations(CheckoutSaga saga) {
        log.info("Compensation Started for Saga: {}", saga.getId());
        saga.setCompensationStartedAt(LocalDateTime.now());

        // Restore Inventory - ONLY if actually reduced
        if (saga.isInventoryReduced() && saga.getReducedInventoryItems() != null && !saga.getReducedInventoryItems().isEmpty()) {
            try {
                Map<String, Object> req = new HashMap<>();
                req.put("items", saga.getReducedInventoryItems());
                restTemplate.postForEntity(PRODUCT_SERVICE_URL + "/api/products/inventory/restore", req, String.class);
                log.info("Inventory Restored for Saga: {}", saga.getId());
            } catch (Exception e) {
                log.error("Failed to restore inventory for Saga: {}", saga.getId(), e);
            }
        }

        // Cancel Order - ONLY if actually created
        if (saga.isOrderCreated() && saga.getInternalOrderId() != null) {
            try {
                orderService.cancelOrder(saga.getInternalOrderId());
                log.info("Cancelling Order {} for Saga: {}", saga.getInternalOrderId(), saga.getId());
            } catch (Exception e) {
                log.error("Failed to cancel order {} for Saga: {}", saga.getInternalOrderId(), saga.getId(), e);
            }
        }

        // Refund Payment - ONLY if actually completed
        if (saga.isPaymentCompleted() && saga.getRazorpayPaymentId() != null) {
            try {
                Map<String, String> req = new HashMap<>();
                req.put("paymentId", saga.getRazorpayPaymentId());
                restTemplate.postForEntity(PAYMENT_SERVICE_URL + "/payments/refund", req, Map.class);
                log.info("Refunding Payment {} for Saga: {}", saga.getRazorpayPaymentId(), saga.getId());
            } catch (Exception e) {
                log.error("Failed to refund payment {} for Saga: {}", saga.getRazorpayPaymentId(), saga.getId(), e);
            }
        }

        saga.setState(SagaState.COMPENSATED);
        saga.setCompensationCompletedAt(LocalDateTime.now());
        saga.setUpdatedAt(LocalDateTime.now());
        sagaRepository.save(saga);
        log.info("Compensation Completed. Final Status: COMPENSATED for Saga: {}", saga.getId());
    }

    public CheckoutSaga getSagaByCorrelationId(String correlationId) {
        return sagaRepository.findByCorrelationId(correlationId)
                .orElseThrow(() -> new RuntimeException("Saga not found for correlationId: " + correlationId));
    }
}
