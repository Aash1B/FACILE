package com.facile.productinventoryservice.initializer;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(10)
@RequiredArgsConstructor
public class ProductImageSchemaInitializer implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE products ALTER COLUMN image TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE product_images ALTER COLUMN image_url TYPE TEXT");
        } catch (Exception e) {
            System.err.println("Failed to execute image schema initializer: " + e.getMessage());
            // Ignore failure, allow application to start
        }
    }
}
