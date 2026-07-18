package com.facile.productinventoryservice.initializer;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(10)
@RequiredArgsConstructor
public class InventorySalesSchemaInitializer implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        Boolean soldColumnExists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'inventories'
                      AND column_name = 'sold'
                )
                """,
                Boolean.class
        );

        // ADD COLUMN also locks the table, so only execute it for an old schema.
        if (!Boolean.TRUE.equals(soldColumnExists)) {
            jdbcTemplate.execute(
                    "ALTER TABLE inventories ADD COLUMN sold INTEGER NOT NULL DEFAULT 0"
            );
        }
    }
}
