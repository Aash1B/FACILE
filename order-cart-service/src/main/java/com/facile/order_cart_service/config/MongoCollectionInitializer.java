package com.facile.order_cart_service.config;

import com.facile.order_cart_service.cart.Cart;
import com.facile.order_cart_service.order.Order;
import com.facile.order_cart_service.order.saga.CheckoutSaga;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MongoCollectionInitializer implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        for (Class<?> documentType : List.of(Cart.class, Order.class, CheckoutSaga.class)) {
            if (!mongoTemplate.collectionExists(documentType)) {
                mongoTemplate.createCollection(documentType);
            }
        }
    }
}
