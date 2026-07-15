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
        Category electronics = categoryRepository.save(Category.builder().name("Electronics").description("Smart gadgets and electronics").image("https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=250").build());
        Category fashion = categoryRepository.save(Category.builder().name("Fashion").description("Trending clothes and styles").image("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=250").build());
        Category homeKitchen = categoryRepository.save(Category.builder().name("Home & Kitchen").description("Kitchenware and home decor").image("https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=250").build());
        Category beauty = categoryRepository.save(Category.builder().name("Beauty").description("Cosmetics and perfumes").image("https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=250").build());
        Category sports = categoryRepository.save(Category.builder().name("Sports").description("Sporting goods and shoes").image("https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=250").build());
        Category toysBaby = categoryRepository.save(Category.builder().name("Toys & Baby").description("Toys and baby care products").image("https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=250").build());

        // 2. Seed SubCategories
        SubCategory wearables = subCategoryRepository.save(SubCategory.builder().name("Wearables").category(electronics).build());
        SubCategory audio = subCategoryRepository.save(SubCategory.builder().name("Audio").category(electronics).build());
        SubCategory gadgets = subCategoryRepository.save(SubCategory.builder().name("Gadgets").category(electronics).build());

        SubCategory apparel = subCategoryRepository.save(SubCategory.builder().name("Apparel").category(fashion).build());
        SubCategory winterwear = subCategoryRepository.save(SubCategory.builder().name("Winterwear").category(fashion).build());

        SubCategory cookware = subCategoryRepository.save(SubCategory.builder().name("Cookware").category(homeKitchen).build());
        SubCategory homeDecor = subCategoryRepository.save(SubCategory.builder().name("Home Decor").category(homeKitchen).build());

        SubCategory skincare = subCategoryRepository.save(SubCategory.builder().name("Skincare").category(beauty).build());
        SubCategory fragrance = subCategoryRepository.save(SubCategory.builder().name("Fragrance").category(beauty).build());

        SubCategory footwear = subCategoryRepository.save(SubCategory.builder().name("Footwear").category(sports).build());
        SubCategory fitnessGear = subCategoryRepository.save(SubCategory.builder().name("Fitness Gear").category(sports).build());

        SubCategory babyToys = subCategoryRepository.save(SubCategory.builder().name("Baby Toys").category(toysBaby).build());
        SubCategory babyCare = subCategoryRepository.save(SubCategory.builder().name("Baby Care").category(toysBaby).build());

        // 3. Seed Products and Inventory (10 products per category)
        
        // ELECTRONICS (1-10)
        saveProductAndInventory("Smart Watch Series 5", "Smart Watch with Health Tracking, Heart Rate Monitor, and GPS", new BigDecimal("12999.00"), new BigDecimal("8999.00"), 
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400", electronics, wearables, 4.5, 128, 50);
        saveProductAndInventory("Wireless Headphones", "High fidelity wireless noise-cancelling headphones", new BigDecimal("8999.00"), new BigDecimal("5999.00"), 
                "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=400", electronics, audio, 4.7, 98, 50);
        saveProductAndInventory("Bluetooth Speaker", "Portable waterproof outdoor bluetooth speaker", new BigDecimal("4999.00"), new BigDecimal("2499.00"), 
                "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=400", electronics, audio, 4.3, 142, 50);
        saveProductAndInventory("Smart Fitness Band", "Waterproof fitness band with sleep tracker", new BigDecimal("3499.00"), new BigDecimal("1999.00"), 
                "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=400", electronics, wearables, 4.2, 210, 50);
        saveProductAndInventory("Wireless Earbuds", "True wireless stereo earbuds with active noise cancelation", new BigDecimal("5999.00"), new BigDecimal("2999.00"), 
                "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400", electronics, audio, 4.6, 325, 50);
        saveProductAndInventory("Noise Cancelling Headphones", "Over-ear active noise cancelling headphones", new BigDecimal("19999.00"), new BigDecimal("14999.00"), 
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400", electronics, audio, 4.8, 85, 50);
        saveProductAndInventory("Smart Home Speaker", "Voice controlled smart assistant home speaker", new BigDecimal("7999.00"), new BigDecimal("4499.00"), 
                "https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=400", electronics, gadgets, 4.4, 115, 50);
        saveProductAndInventory("Dual USB Fast Charger", "High speed wall charger with dual ports", new BigDecimal("1499.00"), new BigDecimal("799.00"), 
                "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=400", electronics, gadgets, 4.1, 95, 50);
        saveProductAndInventory("Ergonomic Wireless Mouse", "Multi-device wireless mouse with ergonomic design", new BigDecimal("2499.00"), new BigDecimal("1299.00"), 
                "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=400", electronics, gadgets, 4.3, 164, 50);
        saveProductAndInventory("Mechanical Gaming Keyboard", "Backlit mechanical keyboard with tactile blue switches", new BigDecimal("6999.00"), new BigDecimal("3999.00"), 
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400", electronics, gadgets, 4.5, 74, 50);

        // FASHION (11-20)
        saveProductAndInventory("Premium Cotton T-Shirt", "100% organic premium combed cotton tee", new BigDecimal("1499.00"), new BigDecimal("799.00"), 
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400", fashion, apparel, 4.4, 215, 50);
        saveProductAndInventory("Slim Fit Denim Jeans", "Classic dark wash stretchable denim jeans", new BigDecimal("3499.00"), new BigDecimal("1999.00"), 
                "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400", fashion, apparel, 4.3, 189, 50);
        saveProductAndInventory("Classic Leather Jacket", "Genuine vintage leather jacket with zipper pockets", new BigDecimal("7999.00"), new BigDecimal("4999.00"), 
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400", fashion, apparel, 4.7, 54, 50);
        saveProductAndInventory("Summer Floral Dress", "Lightweight breathable A-line summer dress", new BigDecimal("2999.00"), new BigDecimal("1499.00"), 
                "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400", fashion, apparel, 4.5, 112, 50);
        saveProductAndInventory("Casual Cotton Shirt", "Full sleeve button down casual cotton shirt", new BigDecimal("1999.00"), new BigDecimal("999.00"), 
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400", fashion, apparel, 4.2, 147, 50);
        saveProductAndInventory("Woolen Winter Sweater", "Warm knit woolen sweater for cold winters", new BigDecimal("3999.00"), new BigDecimal("2499.00"), 
                "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400", fashion, winterwear, 4.6, 92, 50);
        saveProductAndInventory("Linen Summer Shorts", "Relaxed fit linen casual summer shorts", new BigDecimal("1499.00"), new BigDecimal("899.00"), 
                "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=400", fashion, apparel, 4.1, 73, 50);
        saveProductAndInventory("Ethnic Kurta Set", "Beautiful traditional cotton printed kurta set", new BigDecimal("4999.00"), new BigDecimal("2999.00"), 
                "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400", fashion, apparel, 4.5, 134, 50);
        saveProductAndInventory("Waterproof Windbreaker", "Sporty lightweight outdoor windbreaker jacket", new BigDecimal("3499.00"), new BigDecimal("2199.00"), 
                "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=400", fashion, winterwear, 4.3, 62, 50);
        saveProductAndInventory("Designer Silk Scarf", "Smooth luxurious printed designer silk scarf", new BigDecimal("1999.00"), new BigDecimal("999.00"), 
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400", fashion, apparel, 4.4, 48, 50);

        // HOME & KITCHEN (21-30)
        saveProductAndInventory("Stainless Steel Cookware Set", "Premium 5-piece stainless steel pot and pan set", new BigDecimal("6999.00"), new BigDecimal("4499.00"), 
                "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=400", homeKitchen, cookware, 4.6, 178, 50);
        saveProductAndInventory("Handcrafted Ceramic Vase", "Artisanal glazed ceramic flower vase for home decor", new BigDecimal("1999.00"), new BigDecimal("1199.00"), 
                "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=400", homeKitchen, homeDecor, 4.7, 84, 50);
        saveProductAndInventory("Premium Non-Stick Pan", "Durable induction-compatible non-stick frying pan", new BigDecimal("2499.00"), new BigDecimal("1599.00"), 
                "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=400", homeKitchen, cookware, 4.4, 155, 50);
        saveProductAndInventory("Spice Rack Organizer", "12-piece rotating glass spice jar kitchen organizer", new BigDecimal("1499.00"), new BigDecimal("899.00"), 
                "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?q=80&w=400", homeKitchen, cookware, 4.3, 119, 50);
        saveProductAndInventory("French Press Coffee Maker", "Double-walled stainless steel french press coffee plunge", new BigDecimal("2999.00"), new BigDecimal("1799.00"), 
                "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=400", homeKitchen, cookware, 4.6, 210, 50);
        saveProductAndInventory("Cotton Cushion Covers", "Set of 4 printed geometric cotton cushion covers", new BigDecimal("999.00"), new BigDecimal("599.00"), 
                "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=400", homeKitchen, homeDecor, 4.2, 94, 50);
        saveProductAndInventory("LED Desk Study Lamp", "Eye-care dimmable desk study lamp with USB port", new BigDecimal("1999.00"), new BigDecimal("999.00"), 
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=400", homeKitchen, homeDecor, 4.1, 137, 50);
        saveProductAndInventory("Glass Water Bottle Set", "Set of 6 leakproof borosilicate glass water bottles", new BigDecimal("1299.00"), new BigDecimal("799.00"), 
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=400", homeKitchen, cookware, 4.2, 68, 50);
        saveProductAndInventory("Memory Foam Cushion", "Ergonomic memory foam seat cushion for office chairs", new BigDecimal("2499.00"), new BigDecimal("1399.00"), 
                "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=400", homeKitchen, homeDecor, 4.4, 122, 50);
        saveProductAndInventory("Digital Kitchen Scale", "High precision slim digital food weighing scale", new BigDecimal("999.00"), new BigDecimal("499.00"), 
                "https://images.unsplash.com/photo-1594756297426-302fb0b25e13?q=80&w=400", homeKitchen, cookware, 4.3, 89, 50);

        // BEAUTY (31-40)
        saveProductAndInventory("Luxury Perfume", "Exquisite long-lasting luxury signature fragrance", new BigDecimal("4999.00"), new BigDecimal("2999.00"), 
                "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400", beauty, fragrance, 4.8, 64, 50);
        saveProductAndInventory("Organic Face Serum", "Vitamin C and Hyaluronic Acid organic skin serum", new BigDecimal("1999.00"), new BigDecimal("1299.00"), 
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400", beauty, skincare, 4.6, 142, 50);
        saveProductAndInventory("Hydrating Lip Balm Set", "Pack of 3 fruity organic hydrating lip balms", new BigDecimal("999.00"), new BigDecimal("599.00"), 
                "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=400", beauty, skincare, 4.2, 85, 50);
        saveProductAndInventory("Charcoal Face Mask Wash", "Deep cleansing activated charcoal face mask wash", new BigDecimal("799.00"), new BigDecimal("449.00"), 
                "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400", beauty, skincare, 4.1, 108, 50);
        saveProductAndInventory("Nourishing Hair Oil", "Herbal cold-pressed nourishing argan hair oil", new BigDecimal("899.00"), new BigDecimal("549.00"), 
                "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400", beauty, skincare, 4.3, 114, 50);
        saveProductAndInventory("Matte Liquid Lipstick", "Waterproof long-wear velvet matte liquid lipstick", new BigDecimal("1199.00"), new BigDecimal("799.00"), 
                "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=400", beauty, skincare, 4.5, 96, 50);
        saveProductAndInventory("Vitamin C Moisturizer", "Daily skin brightening Vitamin C face moisturizer", new BigDecimal("1499.00"), new BigDecimal("899.00"), 
                "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=400", beauty, skincare, 4.4, 73, 50);
        saveProductAndInventory("Herbal Sunscreen SPF 50", "Non-greasy broad spectrum SPF 50 herbal sunscreen", new BigDecimal("699.00"), new BigDecimal("499.00"), 
                "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400", beauty, skincare, 4.5, 127, 50);
        saveProductAndInventory("Makeup Brush Set", "10-piece professional synthetic hair makeup brush set", new BigDecimal("2499.00"), new BigDecimal("1499.00"), 
                "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400", beauty, skincare, 4.3, 58, 50);
        saveProductAndInventory("Essential Lavender Oil", "100% pure steam distilled therapeutic lavender oil", new BigDecimal("599.00"), new BigDecimal("399.00"), 
                "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=400", beauty, fragrance, 4.6, 79, 50);

        // SPORTS (41-50)
        saveProductAndInventory("Running Shoes", "Lightweight cushioned running shoes for athletes", new BigDecimal("7999.00"), new BigDecimal("4999.00"), 
                "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400", sports, footwear, 4.4, 78, 50);
        saveProductAndInventory("Yoga Mat with Strap", "6mm anti-slip durable TPE yoga mat with carry strap", new BigDecimal("1999.00"), new BigDecimal("1199.00"), 
                "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=400", sports, fitnessGear, 4.7, 143, 50);
        saveProductAndInventory("Gym Shaker Bottle", "Leakproof stainless steel protein gym shaker bottle", new BigDecimal("999.00"), new BigDecimal("599.00"), 
                "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=400", sports, fitnessGear, 4.2, 95, 50);
        saveProductAndInventory("Adjustable Dumbbell Set", "10kg adjustable rubber dumbbell pair set for home workout", new BigDecimal("4999.00"), new BigDecimal("2999.00"), 
                "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=400", sports, fitnessGear, 4.5, 114, 50);
        saveProductAndInventory("Sports Running Socks", "Pack of 3 breathable athletic sports compression socks", new BigDecimal("799.00"), new BigDecimal("499.00"), 
                "https://images.unsplash.com/photo-1582966772680-860e372bb558?q=80&w=400", sports, footwear, 4.3, 84, 50);
        saveProductAndInventory("Compression Knee Sleeve", "Elastic knee support brace sleeve for running and gym", new BigDecimal("999.00"), new BigDecimal("499.00"), 
                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400", sports, fitnessGear, 4.1, 76, 50);
        saveProductAndInventory("Badminton Racket Pack", "Durable twin badminton rackets pack with carrying cover", new BigDecimal("3499.00"), new BigDecimal("1999.00"), 
                "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=400", sports, fitnessGear, 4.5, 118, 50);
        saveProductAndInventory("Tennis Balls Pack", "Pack of 3 heavy duty high bouncing tennis balls", new BigDecimal("499.00"), new BigDecimal("299.00"), 
                "https://images.unsplash.com/photo-1592709823125-a191f07a2a5e?q=80&w=400", sports, fitnessGear, 4.4, 59, 50);
        saveProductAndInventory("Gym Duffel Bag", "Spacious water resistant gym duffel bag with shoe pocket", new BigDecimal("2499.00"), new BigDecimal("1399.00"), 
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400", sports, fitnessGear, 4.6, 92, 50);
        saveProductAndInventory("Speed Skipping Rope", "Premium adjustable tangle-free jump fitness speed rope", new BigDecimal("599.00"), new BigDecimal("349.00"), 
                "https://images.unsplash.com/photo-1447049959918-d5743c95977c?q=80&w=400", sports, fitnessGear, 4.3, 107, 50);

        // TOYS & BABY (51-60)
        saveProductAndInventory("Wooden Educational Blocks", "Organic wooden alphabet and geometric educational blocks", new BigDecimal("1999.00"), new BigDecimal("1299.00"), 
                "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=400", toysBaby, babyToys, 4.7, 115, 50);
        saveProductAndInventory("Soft Plush Teddy Bear", "Huggy hypoallergenic non-toxic brown plush teddy bear", new BigDecimal("1299.00"), new BigDecimal("799.00"), 
                "https://images.unsplash.com/photo-1559251606-c623743a6d76?q=80&w=400", toysBaby, babyToys, 4.6, 143, 50);
        saveProductAndInventory("Baby Teething Toy Set", "Pack of 4 BPA-free food grade silicone baby teethers", new BigDecimal("799.00"), new BigDecimal("499.00"), 
                "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400", toysBaby, babyToys, 4.3, 67, 50);
        saveProductAndInventory("Baby Musical Toy", "Interactive musical drum and piano developmental baby toy", new BigDecimal("2499.00"), new BigDecimal("1599.00"), 
                "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=400", toysBaby, babyToys, 4.5, 92, 50);
        saveProductAndInventory("Organic Baby Swaddle", "Pack of 2 ultra soft organic cotton baby swaddle blankets", new BigDecimal("1499.00"), new BigDecimal("899.00"), 
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400", toysBaby, babyCare, 4.4, 126, 50);
        saveProductAndInventory("Diaper Backpack Bag", "Large waterproof multi-functional baby diaper travel bag", new BigDecimal("5999.00"), new BigDecimal("3999.00"), 
                "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=400", toysBaby, babyCare, 4.6, 156, 50);
        saveProductAndInventory("Baby Milestone Blanket", "Premium fleece monthly milestone photography blanket", new BigDecimal("1999.00"), new BigDecimal("1099.00"), 
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400", toysBaby, babyCare, 4.5, 51, 50);
        saveProductAndInventory("Baby Feeding Bottle Set", "Pack of 3 anti-colic baby feeding milk bottles", new BigDecimal("1199.00"), new BigDecimal("799.00"), 
                "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400", toysBaby, babyCare, 4.4, 78, 50);
        saveProductAndInventory("Stacking Rings Toy", "Classic colorful developmental stacking rings toddler toy", new BigDecimal("599.00"), new BigDecimal("349.00"), 
                "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=250", toysBaby, babyToys, 4.3, 102, 50);
        saveProductAndInventory("Floating Bath Toys Set", "Set of 6 floating animal squeeze sound baby bath toys", new BigDecimal("899.00"), new BigDecimal("549.00"), 
                "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400", toysBaby, babyToys, 4.4, 63, 50);
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
