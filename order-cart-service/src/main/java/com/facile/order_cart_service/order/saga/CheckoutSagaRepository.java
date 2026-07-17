package com.facile.order_cart_service.order.saga;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface CheckoutSagaRepository extends MongoRepository<CheckoutSaga, String> {
    Optional<CheckoutSaga> findByIdempotencyKey(String idempotencyKey);
    Optional<CheckoutSaga> findByCorrelationId(String correlationId);
}
