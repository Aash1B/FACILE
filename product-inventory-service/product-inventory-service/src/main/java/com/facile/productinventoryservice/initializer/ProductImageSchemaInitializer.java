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
        alterColumnToTextIfNeeded("products", "image");
        alterColumnToTextIfNeeded("product_images", "image_url");
    }

    private void alterColumnToTextIfNeeded(String tableName, String columnName) {
        String dataType = jdbcTemplate.queryForObject(
                """
                SELECT data_type
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = ?
                  AND column_name = ?
                """,
                String.class,
                tableName,
                columnName
        );

        // ALTER TYPE takes an ACCESS EXCLUSIVE lock even when the column is already
        // TEXT. Avoid taking that lock on every application startup.
        if (!"text".equalsIgnoreCase(dataType)) {
            jdbcTemplate.execute(
                    "ALTER TABLE " + tableName + " ALTER COLUMN " + columnName + " TYPE TEXT"
            );
        }
    }
}
