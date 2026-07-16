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
import java.util.List;

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
        } else {
            // Migrate existing rows that were seeded before the new columns existed
            migrateProductAttributes();
        }
        seedAndMigrateCategories();
    }

    /**
     * Fills brand / color / size / deliveryDays for any product that still has
     * a null brand (i.e. was seeded before these columns were added).
     * Uses product IDs 1-60 seeded in the original order.
     */
    private void migrateProductAttributes() {
        List<Product> all = productRepository.findAll();
        boolean changed = false;
        for (Product p : all) {
            if (p.getBrand() != null) continue; // already migrated
            changed = true;
            applyAttributes(p);
            productRepository.save(p);
        }
        if (changed) {
            System.out.println("[DataInitializer] Product attributes migration completed.");
        }
    }

    private void applyAttributes(Product p) {
        String title = p.getTitle();

        // ── ELECTRONICS ───────────────────────────────────────────────────────
        if (title.equals("Smart Watch Series 5"))         { p.setBrand("Samsung");    p.setColor("Black");    p.setSize("One Size"); p.setDeliveryDays(2); }
        else if (title.equals("Wireless Headphones"))      { p.setBrand("Sony");       p.setColor("Black");    p.setSize("One Size"); p.setDeliveryDays(2); }
        else if (title.equals("Bluetooth Speaker"))        { p.setBrand("JBL");        p.setColor("Red");      p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Smart Fitness Band"))       { p.setBrand("Mi");         p.setColor("Blue");     p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Wireless Earbuds"))         { p.setBrand("boAt");       p.setColor("White");    p.setSize("One Size"); p.setDeliveryDays(2); }
        else if (title.equals("Noise Cancelling Headphones")) { p.setBrand("Bose");    p.setColor("Silver");   p.setSize("One Size"); p.setDeliveryDays(4); }
        else if (title.equals("Smart Home Speaker"))       { p.setBrand("Amazon");     p.setColor("Charcoal"); p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Dual USB Fast Charger"))    { p.setBrand("Anker");      p.setColor("White");    p.setSize("One Size"); p.setDeliveryDays(2); }
        else if (title.equals("Ergonomic Wireless Mouse")) { p.setBrand("Logitech");   p.setColor("Black");    p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Mechanical Gaming Keyboard")) { p.setBrand("HyperX");   p.setColor("Black");    p.setSize("One Size"); p.setDeliveryDays(5); }

        // ── FASHION ───────────────────────────────────────────────────────────
        else if (title.equals("Premium Cotton T-Shirt"))   { p.setBrand("H&M");        p.setColor("White");    p.setSize("M");        p.setDeliveryDays(3); }
        else if (title.equals("Slim Fit Denim Jeans"))     { p.setBrand("Levi's");     p.setColor("Blue");     p.setSize("32");       p.setDeliveryDays(4); }
        else if (title.equals("Classic Leather Jacket"))   { p.setBrand("Zara");       p.setColor("Black");    p.setSize("L");        p.setDeliveryDays(5); }
        else if (title.equals("Summer Floral Dress"))      { p.setBrand("Mango");      p.setColor("Multicolor"); p.setSize("S");      p.setDeliveryDays(3); }
        else if (title.equals("Casual Cotton Shirt"))      { p.setBrand("Arrow");      p.setColor("Blue");     p.setSize("M");        p.setDeliveryDays(3); }
        else if (title.equals("Woolen Winter Sweater"))    { p.setBrand("Allen Solly"); p.setColor("Grey");    p.setSize("L");        p.setDeliveryDays(4); }
        else if (title.equals("Linen Summer Shorts"))      { p.setBrand("United Colors"); p.setColor("Beige"); p.setSize("M");        p.setDeliveryDays(3); }
        else if (title.equals("Ethnic Kurta Set"))         { p.setBrand("Fabindia");   p.setColor("Orange");   p.setSize("M");        p.setDeliveryDays(5); }
        else if (title.equals("Waterproof Windbreaker"))   { p.setBrand("Columbia");   p.setColor("Green");    p.setSize("L");        p.setDeliveryDays(4); }
        else if (title.equals("Designer Silk Scarf"))      { p.setBrand("Louis Philippe"); p.setColor("Red"); p.setSize("One Size"); p.setDeliveryDays(3); }

        // ── HOME & KITCHEN ────────────────────────────────────────────────────
        else if (title.equals("Stainless Steel Cookware Set")) { p.setBrand("Prestige"); p.setColor("Silver"); p.setSize("One Size"); p.setDeliveryDays(5); }
        else if (title.equals("Handcrafted Ceramic Vase"))    { p.setBrand("Ellementry"); p.setColor("White"); p.setSize("One Size"); p.setDeliveryDays(4); }
        else if (title.equals("Premium Non-Stick Pan"))        { p.setBrand("Hawkins");  p.setColor("Black");   p.setSize("One Size"); p.setDeliveryDays(4); }
        else if (title.equals("Spice Rack Organizer"))         { p.setBrand("Cello");    p.setColor("Clear");   p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("French Press Coffee Maker"))    { p.setBrand("Bodum");    p.setColor("Black");   p.setSize("One Size"); p.setDeliveryDays(5); }
        else if (title.equals("Cotton Cushion Covers"))        { p.setBrand("Urban Ladder"); p.setColor("Multicolor"); p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("LED Desk Study Lamp"))          { p.setBrand("Syska");    p.setColor("White");   p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Glass Water Bottle Set"))       { p.setBrand("Borosil");  p.setColor("Clear");   p.setSize("One Size"); p.setDeliveryDays(2); }
        else if (title.equals("Memory Foam Cushion"))          { p.setBrand("Sleepwell"); p.setColor("Grey");   p.setSize("One Size"); p.setDeliveryDays(4); }
        else if (title.equals("Digital Kitchen Scale"))        { p.setBrand("Pigeon");   p.setColor("White");   p.setSize("One Size"); p.setDeliveryDays(3); }

        // ── BEAUTY ────────────────────────────────────────────────────────────
        else if (title.equals("Luxury Perfume"))           { p.setBrand("Fogg");       p.setColor("Gold");     p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Organic Face Serum"))       { p.setBrand("Mamaearth");  p.setColor("Orange");   p.setSize("One Size"); p.setDeliveryDays(2); }
        else if (title.equals("Hydrating Lip Balm Set"))   { p.setBrand("Biotique");   p.setColor("Pink");     p.setSize("One Size"); p.setDeliveryDays(2); }
        else if (title.equals("Charcoal Face Mask Wash"))  { p.setBrand("Plum");       p.setColor("Black");    p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Nourishing Hair Oil"))      { p.setBrand("Kama Ayurveda"); p.setColor("Brown"); p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Matte Liquid Lipstick"))    { p.setBrand("Lakme");      p.setColor("Red");      p.setSize("One Size"); p.setDeliveryDays(2); }
        else if (title.equals("Vitamin C Moisturizer"))    { p.setBrand("Dot & Key");  p.setColor("Yellow");   p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Herbal Sunscreen SPF 50"))  { p.setBrand("WOW");        p.setColor("White");    p.setSize("One Size"); p.setDeliveryDays(2); }
        else if (title.equals("Makeup Brush Set"))         { p.setBrand("PAC");        p.setColor("Rose Gold"); p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Essential Lavender Oil"))   { p.setBrand("Khadi");      p.setColor("Purple");   p.setSize("One Size"); p.setDeliveryDays(3); }

        // ── SPORTS ────────────────────────────────────────────────────────────
        else if (title.equals("Running Shoes"))            { p.setBrand("Nike");       p.setColor("White");    p.setSize("8 UK");     p.setDeliveryDays(3); }
        else if (title.equals("Yoga Mat with Strap"))      { p.setBrand("Boldfit");    p.setColor("Purple");   p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Gym Shaker Bottle"))        { p.setBrand("GNC");        p.setColor("Black");    p.setSize("One Size"); p.setDeliveryDays(2); }
        else if (title.equals("Adjustable Dumbbell Set"))  { p.setBrand("Kore");       p.setColor("Black");    p.setSize("One Size"); p.setDeliveryDays(7); }
        else if (title.equals("Sports Running Socks"))     { p.setBrand("Puma");       p.setColor("White");    p.setSize("Free Size"); p.setDeliveryDays(2); }
        else if (title.equals("Compression Knee Sleeve"))  { p.setBrand("Tynor");      p.setColor("Beige");    p.setSize("M");        p.setDeliveryDays(3); }
        else if (title.equals("Badminton Racket Pack"))    { p.setBrand("Yonex");      p.setColor("Blue");     p.setSize("One Size"); p.setDeliveryDays(4); }
        else if (title.equals("Tennis Balls Pack"))        { p.setBrand("Wilson");     p.setColor("Yellow");   p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Gym Duffel Bag"))           { p.setBrand("Adidas");     p.setColor("Black");    p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Speed Skipping Rope"))      { p.setBrand("Strauss");    p.setColor("Red");      p.setSize("One Size"); p.setDeliveryDays(2); }

        // ── TOYS & BABY ───────────────────────────────────────────────────────
        else if (title.equals("Wooden Educational Blocks")) { p.setBrand("Itsy Bitsy"); p.setColor("Multicolor"); p.setSize("One Size"); p.setDeliveryDays(4); }
        else if (title.equals("Soft Plush Teddy Bear"))    { p.setBrand("Hamleys");    p.setColor("Brown");    p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Baby Teething Toy Set"))    { p.setBrand("Mee Mee");    p.setColor("Pink");     p.setSize("One Size"); p.setDeliveryDays(2); }
        else if (title.equals("Baby Musical Toy"))         { p.setBrand("Fisher-Price"); p.setColor("Multicolor"); p.setSize("One Size"); p.setDeliveryDays(4); }
        else if (title.equals("Organic Baby Swaddle"))     { p.setBrand("SuperBottoms"); p.setColor("White");  p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Diaper Backpack Bag"))      { p.setBrand("Luvlap");     p.setColor("Grey");     p.setSize("One Size"); p.setDeliveryDays(4); }
        else if (title.equals("Baby Milestone Blanket"))   { p.setBrand("Mee Mee");    p.setColor("Pink");     p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Baby Feeding Bottle Set"))  { p.setBrand("Pigeon");     p.setColor("Clear");    p.setSize("One Size"); p.setDeliveryDays(2); }
        else if (title.equals("Stacking Rings Toy"))       { p.setBrand("Funskool");   p.setColor("Multicolor"); p.setSize("One Size"); p.setDeliveryDays(3); }
        else if (title.equals("Floating Bath Toys Set"))   { p.setBrand("Marcus & Marcus"); p.setColor("Multicolor"); p.setSize("One Size"); p.setDeliveryDays(4); }
        // fallback for any unmatched product
        else {
            p.setBrand("Facile");
            p.setColor("Black");
            p.setSize("One Size");
            p.setDeliveryDays(5);
        }
    }

    private void seedCategoriesAndProducts() {
        // 1. Seed Categories
        Category electronics = categoryRepository.save(Category.builder().name("Electronics").description("Smart gadgets and electronics").image("https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=250").build());
        Category fashion = categoryRepository.save(Category.builder().name("Fashion").description("Trending clothes and styles").image("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=250").build());
        Category homeKitchen = categoryRepository.save(Category.builder().name("Home & Living").description("Beautiful essentials for every room and home decor").image("https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=250").build());
        Category beauty = categoryRepository.save(Category.builder().name("Beauty").description("Cosmetics and perfumes").image("https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=250").build());
        Category sports = categoryRepository.save(Category.builder().name("Sports").description("Sporting goods and shoes").image("https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=250").build());
        Category toysBaby = categoryRepository.save(Category.builder().name("Kids & Baby").description("Toys and baby care products").image("https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=250").build());

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

        // 3. Seed Products and Inventory (with new attributes)

        // ELECTRONICS (1-10)
        saveProduct("Smart Watch Series 5", "Smart Watch with Health Tracking, Heart Rate Monitor, and GPS", new BigDecimal("12999.00"), new BigDecimal("8999.00"),
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400", electronics, wearables, 4.5, 128, 50,
                "Samsung", "Black", "One Size", 2);
        saveProduct("Wireless Headphones", "High fidelity wireless noise-cancelling headphones", new BigDecimal("8999.00"), new BigDecimal("5999.00"),
                "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=400", electronics, audio, 4.7, 98, 50,
                "Sony", "Black", "One Size", 2);
        saveProduct("Bluetooth Speaker", "Portable waterproof outdoor bluetooth speaker", new BigDecimal("4999.00"), new BigDecimal("2499.00"),
                "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=400", electronics, audio, 4.3, 142, 50,
                "JBL", "Red", "One Size", 3);
        saveProduct("Smart Fitness Band", "Waterproof fitness band with sleep tracker", new BigDecimal("3499.00"), new BigDecimal("1999.00"),
                "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=400", electronics, wearables, 4.2, 210, 50,
                "Mi", "Blue", "One Size", 3);
        saveProduct("Wireless Earbuds", "True wireless stereo earbuds with active noise cancelation", new BigDecimal("5999.00"), new BigDecimal("2999.00"),
                "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400", electronics, audio, 4.6, 325, 50,
                "boAt", "White", "One Size", 2);
        saveProduct("Noise Cancelling Headphones", "Over-ear active noise cancelling headphones", new BigDecimal("19999.00"), new BigDecimal("14999.00"),
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400", electronics, audio, 4.8, 85, 50,
                "Bose", "Silver", "One Size", 4);
        saveProduct("Smart Home Speaker", "Voice controlled smart assistant home speaker", new BigDecimal("7999.00"), new BigDecimal("4499.00"),
                "https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=400", electronics, gadgets, 4.4, 115, 50,
                "Amazon", "Charcoal", "One Size", 3);
        saveProduct("Dual USB Fast Charger", "High speed wall charger with dual ports", new BigDecimal("1499.00"), new BigDecimal("799.00"),
                "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=400", electronics, gadgets, 4.1, 95, 50,
                "Anker", "White", "One Size", 2);
        saveProduct("Ergonomic Wireless Mouse", "Multi-device wireless mouse with ergonomic design", new BigDecimal("2499.00"), new BigDecimal("1299.00"),
                "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=400", electronics, gadgets, 4.3, 164, 50,
                "Logitech", "Black", "One Size", 3);
        saveProduct("Mechanical Gaming Keyboard", "Backlit mechanical keyboard with tactile blue switches", new BigDecimal("6999.00"), new BigDecimal("3999.00"),
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400", electronics, gadgets, 4.5, 74, 50,
                "HyperX", "Black", "One Size", 5);

        // FASHION (11-20)
        saveProduct("Premium Cotton T-Shirt", "100% organic premium combed cotton tee", new BigDecimal("1499.00"), new BigDecimal("799.00"),
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400", fashion, apparel, 4.4, 215, 50,
                "H&M", "White", "M", 3);
        saveProduct("Slim Fit Denim Jeans", "Classic dark wash stretchable denim jeans", new BigDecimal("3499.00"), new BigDecimal("1999.00"),
                "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400", fashion, apparel, 4.3, 189, 50,
                "Levi's", "Blue", "32", 4);
        saveProduct("Classic Leather Jacket", "Genuine vintage leather jacket with zipper pockets", new BigDecimal("7999.00"), new BigDecimal("4999.00"),
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400", fashion, apparel, 4.7, 54, 50,
                "Zara", "Black", "L", 5);
        saveProduct("Summer Floral Dress", "Lightweight breathable A-line summer dress", new BigDecimal("2999.00"), new BigDecimal("1499.00"),
                "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400", fashion, apparel, 4.5, 112, 50,
                "Mango", "Multicolor", "S", 3);
        saveProduct("Casual Cotton Shirt", "Full sleeve button down casual cotton shirt", new BigDecimal("1999.00"), new BigDecimal("999.00"),
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400", fashion, apparel, 4.2, 147, 50,
                "Arrow", "Blue", "M", 3);
        saveProduct("Woolen Winter Sweater", "Warm knit woolen sweater for cold winters", new BigDecimal("3999.00"), new BigDecimal("2499.00"),
                "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400", fashion, winterwear, 4.6, 92, 50,
                "Allen Solly", "Grey", "L", 4);
        saveProduct("Linen Summer Shorts", "Relaxed fit linen casual summer shorts", new BigDecimal("1499.00"), new BigDecimal("899.00"),
                "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=400", fashion, apparel, 4.1, 73, 50,
                "United Colors", "Beige", "M", 3);
        saveProduct("Ethnic Kurta Set", "Beautiful traditional cotton printed kurta set", new BigDecimal("4999.00"), new BigDecimal("2999.00"),
                "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400", fashion, apparel, 4.5, 134, 50,
                "Fabindia", "Orange", "M", 5);
        saveProduct("Waterproof Windbreaker", "Sporty lightweight outdoor windbreaker jacket", new BigDecimal("3499.00"), new BigDecimal("2199.00"),
                "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=400", fashion, winterwear, 4.3, 62, 50,
                "Columbia", "Green", "L", 4);
        saveProduct("Designer Silk Scarf", "Smooth luxurious printed designer silk scarf", new BigDecimal("1999.00"), new BigDecimal("999.00"),
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400", fashion, apparel, 4.4, 48, 50,
                "Louis Philippe", "Red", "One Size", 3);

        // HOME & KITCHEN (21-30)
        saveProduct("Stainless Steel Cookware Set", "Premium 5-piece stainless steel pot and pan set", new BigDecimal("6999.00"), new BigDecimal("4499.00"),
                "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=400", homeKitchen, cookware, 4.6, 178, 50,
                "Prestige", "Silver", "One Size", 5);
        saveProduct("Handcrafted Ceramic Vase", "Artisanal glazed ceramic flower vase for home decor", new BigDecimal("1999.00"), new BigDecimal("1199.00"),
                "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=400", homeKitchen, homeDecor, 4.7, 84, 50,
                "Ellementry", "White", "One Size", 4);
        saveProduct("Premium Non-Stick Pan", "Durable induction-compatible non-stick frying pan", new BigDecimal("2499.00"), new BigDecimal("1599.00"),
                "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=400", homeKitchen, cookware, 4.4, 155, 50,
                "Hawkins", "Black", "One Size", 4);
        saveProduct("Spice Rack Organizer", "12-piece rotating glass spice jar kitchen organizer", new BigDecimal("1499.00"), new BigDecimal("899.00"),
                "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?q=80&w=400", homeKitchen, cookware, 4.3, 119, 50,
                "Cello", "Clear", "One Size", 3);
        saveProduct("French Press Coffee Maker", "Double-walled stainless steel french press coffee plunge", new BigDecimal("2999.00"), new BigDecimal("1799.00"),
                "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=400", homeKitchen, cookware, 4.6, 210, 50,
                "Bodum", "Black", "One Size", 5);
        saveProduct("Cotton Cushion Covers", "Set of 4 printed geometric cotton cushion covers", new BigDecimal("999.00"), new BigDecimal("599.00"),
                "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=400", homeKitchen, homeDecor, 4.2, 94, 50,
                "Urban Ladder", "Multicolor", "One Size", 3);
        saveProduct("LED Desk Study Lamp", "Eye-care dimmable desk study lamp with USB port", new BigDecimal("1999.00"), new BigDecimal("999.00"),
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=400", homeKitchen, homeDecor, 4.1, 137, 50,
                "Syska", "White", "One Size", 3);
        saveProduct("Glass Water Bottle Set", "Set of 6 leakproof borosilicate glass water bottles", new BigDecimal("1299.00"), new BigDecimal("799.00"),
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=400", homeKitchen, cookware, 4.2, 68, 50,
                "Borosil", "Clear", "One Size", 2);
        saveProduct("Memory Foam Cushion", "Ergonomic memory foam seat cushion for office chairs", new BigDecimal("2499.00"), new BigDecimal("1399.00"),
                "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=400", homeKitchen, homeDecor, 4.4, 122, 50,
                "Sleepwell", "Grey", "One Size", 4);
        saveProduct("Digital Kitchen Scale", "High precision slim digital food weighing scale", new BigDecimal("999.00"), new BigDecimal("499.00"),
                "https://images.unsplash.com/photo-1594756297426-302fb0b25e13?q=80&w=400", homeKitchen, cookware, 4.3, 89, 50,
                "Pigeon", "White", "One Size", 3);

        // BEAUTY (31-40)
        saveProduct("Luxury Perfume", "Exquisite long-lasting luxury signature fragrance", new BigDecimal("4999.00"), new BigDecimal("2999.00"),
                "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400", beauty, fragrance, 4.8, 64, 50,
                "Fogg", "Gold", "One Size", 3);
        saveProduct("Organic Face Serum", "Vitamin C and Hyaluronic Acid organic skin serum", new BigDecimal("1999.00"), new BigDecimal("1299.00"),
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400", beauty, skincare, 4.6, 142, 50,
                "Mamaearth", "Orange", "One Size", 2);
        saveProduct("Hydrating Lip Balm Set", "Pack of 3 fruity organic hydrating lip balms", new BigDecimal("999.00"), new BigDecimal("599.00"),
                "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=400", beauty, skincare, 4.2, 85, 50,
                "Biotique", "Pink", "One Size", 2);
        saveProduct("Charcoal Face Mask Wash", "Deep cleansing activated charcoal face mask wash", new BigDecimal("799.00"), new BigDecimal("449.00"),
                "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400", beauty, skincare, 4.1, 108, 50,
                "Plum", "Black", "One Size", 3);
        saveProduct("Nourishing Hair Oil", "Herbal cold-pressed nourishing argan hair oil", new BigDecimal("899.00"), new BigDecimal("549.00"),
                "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400", beauty, skincare, 4.3, 114, 50,
                "Kama Ayurveda", "Brown", "One Size", 3);
        saveProduct("Matte Liquid Lipstick", "Waterproof long-wear velvet matte liquid lipstick", new BigDecimal("1199.00"), new BigDecimal("799.00"),
                "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=400", beauty, skincare, 4.5, 96, 50,
                "Lakme", "Red", "One Size", 2);
        saveProduct("Vitamin C Moisturizer", "Daily skin brightening Vitamin C face moisturizer", new BigDecimal("1499.00"), new BigDecimal("899.00"),
                "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=400", beauty, skincare, 4.4, 73, 50,
                "Dot & Key", "Yellow", "One Size", 3);
        saveProduct("Herbal Sunscreen SPF 50", "Non-greasy broad spectrum SPF 50 herbal sunscreen", new BigDecimal("699.00"), new BigDecimal("499.00"),
                "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400", beauty, skincare, 4.5, 127, 50,
                "WOW", "White", "One Size", 2);
        saveProduct("Makeup Brush Set", "10-piece professional synthetic hair makeup brush set", new BigDecimal("2499.00"), new BigDecimal("1499.00"),
                "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400", beauty, skincare, 4.3, 58, 50,
                "PAC", "Rose Gold", "One Size", 3);
        saveProduct("Essential Lavender Oil", "100% pure steam distilled therapeutic lavender oil", new BigDecimal("599.00"), new BigDecimal("399.00"),
                "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=400", beauty, fragrance, 4.6, 79, 50,
                "Khadi", "Purple", "One Size", 3);

        // SPORTS (41-50)
        saveProduct("Running Shoes", "Lightweight cushioned running shoes for athletes", new BigDecimal("7999.00"), new BigDecimal("4999.00"),
                "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400", sports, footwear, 4.4, 78, 50,
                "Nike", "White", "8 UK", 3);
        saveProduct("Yoga Mat with Strap", "6mm anti-slip durable TPE yoga mat with carry strap", new BigDecimal("1999.00"), new BigDecimal("1199.00"),
                "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=400", sports, fitnessGear, 4.7, 143, 50,
                "Boldfit", "Purple", "One Size", 3);
        saveProduct("Gym Shaker Bottle", "Leakproof stainless steel protein gym shaker bottle", new BigDecimal("999.00"), new BigDecimal("599.00"),
                "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=400", sports, fitnessGear, 4.2, 95, 50,
                "GNC", "Black", "One Size", 2);
        saveProduct("Adjustable Dumbbell Set", "10kg adjustable rubber dumbbell pair set for home workout", new BigDecimal("4999.00"), new BigDecimal("2999.00"),
                "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=400", sports, fitnessGear, 4.5, 114, 50,
                "Kore", "Black", "One Size", 7);
        saveProduct("Sports Running Socks", "Pack of 3 breathable athletic sports compression socks", new BigDecimal("799.00"), new BigDecimal("499.00"),
                "https://images.unsplash.com/photo-1582966772680-860e372bb558?q=80&w=400", sports, footwear, 4.3, 84, 50,
                "Puma", "White", "Free Size", 2);
        saveProduct("Compression Knee Sleeve", "Elastic knee support brace sleeve for running and gym", new BigDecimal("999.00"), new BigDecimal("499.00"),
                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400", sports, fitnessGear, 4.1, 76, 50,
                "Tynor", "Beige", "M", 3);
        saveProduct("Badminton Racket Pack", "Durable twin badminton rackets pack with carrying cover", new BigDecimal("3499.00"), new BigDecimal("1999.00"),
                "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=400", sports, fitnessGear, 4.5, 118, 50,
                "Yonex", "Blue", "One Size", 4);
        saveProduct("Tennis Balls Pack", "Pack of 3 heavy duty high bouncing tennis balls", new BigDecimal("499.00"), new BigDecimal("299.00"),
                "https://images.unsplash.com/photo-1592709823125-a191f07a2a5e?q=80&w=400", sports, fitnessGear, 4.4, 59, 50,
                "Wilson", "Yellow", "One Size", 3);
        saveProduct("Gym Duffel Bag", "Spacious water resistant gym duffel bag with shoe pocket", new BigDecimal("2499.00"), new BigDecimal("1399.00"),
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400", sports, fitnessGear, 4.6, 92, 50,
                "Adidas", "Black", "One Size", 3);
        saveProduct("Speed Skipping Rope", "Premium adjustable tangle-free jump fitness speed rope", new BigDecimal("599.00"), new BigDecimal("349.00"),
                "https://images.unsplash.com/photo-1447049959918-d5743c95977c?q=80&w=400", sports, fitnessGear, 4.3, 107, 50,
                "Strauss", "Red", "One Size", 2);

        // TOYS & BABY (51-60)
        saveProduct("Wooden Educational Blocks", "Organic wooden alphabet and geometric educational blocks", new BigDecimal("1999.00"), new BigDecimal("1299.00"),
                "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=400", toysBaby, babyToys, 4.7, 115, 50,
                "Itsy Bitsy", "Multicolor", "One Size", 4);
        saveProduct("Soft Plush Teddy Bear", "Huggy hypoallergenic non-toxic brown plush teddy bear", new BigDecimal("1299.00"), new BigDecimal("799.00"),
                "https://images.unsplash.com/photo-1559251606-c623743a6d76?q=80&w=400", toysBaby, babyToys, 4.6, 143, 50,
                "Hamleys", "Brown", "One Size", 3);
        saveProduct("Baby Teething Toy Set", "Pack of 4 BPA-free food grade silicone baby teethers", new BigDecimal("799.00"), new BigDecimal("499.00"),
                "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400", toysBaby, babyToys, 4.3, 67, 50,
                "Mee Mee", "Pink", "One Size", 2);
        saveProduct("Baby Musical Toy", "Interactive musical drum and piano developmental baby toy", new BigDecimal("2499.00"), new BigDecimal("1599.00"),
                "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=400", toysBaby, babyToys, 4.5, 92, 50,
                "Fisher-Price", "Multicolor", "One Size", 4);
        saveProduct("Organic Baby Swaddle", "Pack of 2 ultra soft organic cotton baby swaddle blankets", new BigDecimal("1499.00"), new BigDecimal("899.00"),
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400", toysBaby, babyCare, 4.4, 126, 50,
                "SuperBottoms", "White", "One Size", 3);
        saveProduct("Diaper Backpack Bag", "Large waterproof multi-functional baby diaper travel bag", new BigDecimal("5999.00"), new BigDecimal("3999.00"),
                "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=400", toysBaby, babyCare, 4.6, 156, 50,
                "Luvlap", "Grey", "One Size", 4);
        saveProduct("Baby Milestone Blanket", "Premium fleece monthly milestone photography blanket", new BigDecimal("1999.00"), new BigDecimal("1099.00"),
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400", toysBaby, babyCare, 4.5, 51, 50,
                "Mee Mee", "Pink", "One Size", 3);
        saveProduct("Baby Feeding Bottle Set", "Pack of 3 anti-colic baby feeding milk bottles", new BigDecimal("1199.00"), new BigDecimal("799.00"),
                "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400", toysBaby, babyCare, 4.4, 78, 50,
                "Pigeon", "Clear", "One Size", 2);
        saveProduct("Stacking Rings Toy", "Classic colorful developmental stacking rings toddler toy", new BigDecimal("599.00"), new BigDecimal("349.00"),
                "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=250", toysBaby, babyToys, 4.3, 102, 50,
                "Funskool", "Multicolor", "One Size", 3);
        saveProduct("Floating Bath Toys Set", "Set of 6 floating animal squeeze sound baby bath toys", new BigDecimal("899.00"), new BigDecimal("549.00"),
                "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400", toysBaby, babyToys, 4.4, 63, 50,
                "Marcus & Marcus", "Multicolor", "One Size", 4);
    }

    private void saveProduct(String title, String desc, BigDecimal mrp, BigDecimal sellingPrice, String image,
                             Category cat, SubCategory subCat, double rating, int reviews, int stock,
                             String brand, String color, String size, int deliveryDays) {
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
                .brand(brand)
                .color(color)
                .size(size)
                .deliveryDays(deliveryDays)
                .build();
        Product savedProduct = productRepository.save(product);

        Inventory inventory = Inventory.builder()
                .productId(savedProduct.getId())
                .stock(stock)
                .build();
        inventoryRepository.save(inventory);
    }

    private void seedAndMigrateCategories() {
        // 1. Rename "Home & Kitchen" to "Home & Living" if present
        categoryRepository.findByName("Home & Kitchen").ifPresent(cat -> {
            cat.setName("Home & Living");
            cat.setDescription("Beautiful essentials for every room and home decor");
            cat.setImage("https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=250");
            categoryRepository.save(cat);
        });

        // 2. Rename "Toys & Baby" to "Kids & Baby" if present
        categoryRepository.findByName("Toys & Baby").ifPresent(cat -> {
            cat.setName("Kids & Baby");
            cat.setDescription("Toys and baby care products");
            cat.setImage("https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=250");
            categoryRepository.save(cat);
        });

        // 3. Seed new categories if not present
        String[][] categoriesInfo = {
            {"Fashion", "Trending clothes and styles", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=250"},
            {"Beauty", "Cosmetics and perfumes", "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=250"},
            {"Home & Living", "Beautiful essentials for every room and home decor", "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=250"},
            {"Jewellery & Accessories", "Elegant jewellery and premium accessories", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=250"},
            {"Footwear", "Stylish footwear for men, women and kids", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=250"},
            {"Electronics", "Smart gadgets and electronics", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=250"},
            {"Stationery", "Notebooks, pens and office essentials", "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=250"},
            {"Kids & Baby", "Toys and baby care products", "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=250"},
            {"Health & Wellness", "Fitness, vitamins and health care", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=250"},
            {"Sports", "Sporting goods and shoes", "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=250"},
            {"Pets", "Supplies and food for your lovely pets", "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=250"}
        };

        for (String[] info : categoriesInfo) {
            String name = info[0];
            String desc = info[1];
            String img = info[2];
            if (categoryRepository.findByName(name).isEmpty()) {
                Category cat = categoryRepository.save(Category.builder()
                        .name(name)
                        .description(desc)
                        .image(img)
                        .build());
                // Seed a default subcategory
                String subName = "General";
                if (name.equals("Jewellery & Accessories")) subName = "Jewellery";
                else if (name.equals("Footwear")) subName = "Shoes";
                else if (name.equals("Stationery")) subName = "Office Supplies";
                else if (name.equals("Health & Wellness")) subName = "Supplements";
                else if (name.equals("Pets")) subName = "Pet Food";
                
                subCategoryRepository.save(SubCategory.builder().name(subName).category(cat).build());
            }
        }
    }
}
