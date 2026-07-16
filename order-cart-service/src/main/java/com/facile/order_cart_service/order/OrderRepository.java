package com.facile.order_cart_service.order;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByUserId(String userId);

    Optional<Order> findByIdempotencyKey(String idempotencyKey);
}
