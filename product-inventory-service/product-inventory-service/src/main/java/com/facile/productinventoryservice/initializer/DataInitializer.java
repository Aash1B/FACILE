package com.facile.productinventoryservice.initializer;

import com.facile.productinventoryservice.model.Category;
import com.facile.productinventoryservice.model.SubCategory;
import com.facile.productinventoryservice.model.Product;
import com.facile.productinventoryservice.model.Inventory;
import com.facile.productinventoryservice.repository.CategoryRepository;
import com.facile.productinventoryservice.repository.SubCategoryRepository;
import com.facile.productinventoryservice.repository.ProductRepository;
import com.facile.productinventoryservice.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            seedCategoriesAndProducts();
        }
    }

    private void seedCategoriesAndProducts() {
        // 1. Seed Categories
        Category electronics = categoryRepository.save(Category.builder().name("Electronics").description("Smart gadgets and electronics").build());
        categoryRepository.save(Category.builder().name("Fashion").description("Trending clothes and styles").build());
        categoryRepository.save(Category.builder().name("Home & Kitchen").description("Kitchenware and home decor").build());
        Category beauty = categoryRepository.save(Category.builder().name("Beauty").description("Cosmetics and perfumes").build());
        Category sports = categoryRepository.save(Category.builder().name("Sports").description("Sporting goods and shoes").build());
        Category toysBaby = categoryRepository.save(Category.builder().name("Toys & Baby").description("Toys and baby care products").build());

        // 2. Seed SubCategories
        SubCategory wearables = subCategoryRepository.save(SubCategory.builder().name("Wearables").category(electronics).build());
        SubCategory audio = subCategoryRepository.save(SubCategory.builder().name("Audio").category(electronics).build());
        SubCategory babyToys = subCategoryRepository.save(SubCategory.builder().name("Baby Toys").category(toysBaby).build());
        SubCategory footwear = subCategoryRepository.save(SubCategory.builder().name("Footwear").category(sports).build());
        SubCategory fragrance = subCategoryRepository.save(SubCategory.builder().name("Fragrance").category(beauty).build());

        // 3. Seed Products and Inventory
        saveProductAndInventory("Smart Watch Series 5", "Smart Watch with Health Tracking", new BigDecimal("129.99"), new BigDecimal("89.99"), 
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400", electronics, wearables, 4.5, 128, 50);

        saveProductAndInventory("Wireless Headphones", "High fidelity wireless noise-cancelling headphones", new BigDecimal("89.99"), new BigDecimal("59.99"), 
                "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=400", electronics, audio, 4.7, 98, 50);

        saveProductAndInventory("Travel Backpack", "Waterproof travel backpack with multiple compartments", new BigDecimal("59.99"), new BigDecimal("39.99"), 
                "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=400", toysBaby, babyToys, 4.6, 156, 50);

        saveProductAndInventory("Running Shoes", "Lightweight running shoes for athletes", new BigDecimal("79.99"), new BigDecimal("49.99"), 
                "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400", sports, footwear, 4.4, 78, 50);

        saveProductAndInventory("Luxury Perfume", "Exquisite long-lasting luxury fragrance", new BigDecimal("49.99"), new BigDecimal("29.99"), 
                "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400", beauty, fragrance, 4.8, 64, 50);
    }

    private void saveProductAndInventory(String title, String desc, BigDecimal mrp, BigDecimal sellingPrice, String image, 
                                         Category cat, SubCategory subCat, double rating, int reviews, int stock) {
        Product product = Product.builder()
                .title(title)
                .description(desc)
                .mrp(mrp)
                .sellingPrice(sellingPrice)
                .image(image)
                .category(cat)
                .subCategory(subCat)
                .rating(rating)
                .reviews(reviews)
                .build();
        Product savedProduct = productRepository.save(product);

        Inventory inventory = Inventory.builder()
                .productId(savedProduct.getId())
                .stock(stock)
                .build();
        inventoryRepository.save(inventory);
    }
}
