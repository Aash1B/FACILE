package com.facile.productinventoryservice.initializer;

import com.facile.productinventoryservice.model.Product;
import com.facile.productinventoryservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(1)
@RequiredArgsConstructor
public class ProductOwnerInitializer implements CommandLineRunner {
    public static final String DEFAULT_SELLER = "facile.seller@gmail.com";
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String... args) {
        for (Product product : productRepository.findAll()) {
            if (product.getSellerEmail() == null || product.getSellerEmail().isBlank()
                    || product.getSellerEmail().equalsIgnoreCase("jewelmars@gmail.com")) {
                product.setSellerEmail(DEFAULT_SELLER);
            }
        }
        productRepository.flush();
    }
}
