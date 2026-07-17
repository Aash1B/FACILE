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
import java.util.ArrayList;
import java.util.Arrays;
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
        // Run standard migrations on existing products to set their attributes if empty
        migrateProductAttributes();

        // Clean up empty subcategories like "Jewellery" if they have no products
        cleanupEmptySubcategories();

        // Seed missing categories, subcategories, and products incrementally
        seedMissingCategoriesAndProducts();
    }

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
        else {
            p.setBrand("Facile");
            p.setColor("Black");
            p.setSize("One Size");
            p.setDeliveryDays(5);
        }
    }

    private void cleanupEmptySubcategories() {
        categoryRepository.findByName("Jewellery & Accessories").ifPresent(cat -> {
            subCategoryRepository.findByNameAndCategoryId("Jewellery", cat.getId()).ifPresent(sub -> {
                List<Product> products = productRepository.findBySubCategoryId(sub.getId());
                if (products.isEmpty()) {
                    subCategoryRepository.delete(sub);
                    System.out.println("[DataInitializer] Cleaned up empty 'Jewellery' subcategory under category 'Jewellery & Accessories'");
                }
            });
        });
    }

    private void seedMissingCategoriesAndProducts() {
        List<SeedCategory> seedCategories = getSeedCategories();

        for (SeedCategory seedCat : seedCategories) {
            // Find or create Category
            Category category = categoryRepository.findByName(seedCat.name)
                    .orElseGet(() -> categoryRepository.save(Category.builder()
                            .name(seedCat.name)
                            .description(seedCat.description)
                            .image(seedCat.image)
                            .build()));

            for (SeedSubCategory seedSub : seedCat.subcategories) {
                // Find or create SubCategory under this Category
                SubCategory subCategory = subCategoryRepository.findByNameAndCategoryId(seedSub.name, category.getId())
                        .orElseGet(() -> subCategoryRepository.save(SubCategory.builder()
                                .name(seedSub.name)
                                .category(category)
                                .build()));

                // Check if any product exists under this subcategory. If not, seed a sample product
                List<Product> existingProducts = productRepository.findBySubCategoryId(subCategory.getId());
                if (existingProducts.isEmpty()) {
                    SeedProduct pInfo = seedSub.product;
                    saveProduct(pInfo.title, pInfo.description, pInfo.mrp, pInfo.sellingPrice,
                            pInfo.image, category, subCategory, 4.5, 42, 50,
                            pInfo.brand, pInfo.color, pInfo.size, pInfo.deliveryDays);
                    System.out.println("[DataInitializer] Seeded sample product '" + pInfo.title + 
                            "' for subcategory '" + seedSub.name + "' under category '" + seedCat.name + "'");
                }
            }
        }
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

    private List<SeedCategory> getSeedCategories() {
        List<SeedCategory> categories = new ArrayList<>();

        // 1. Fashion
        categories.add(new SeedCategory(
            "Fashion", "Trending clothes and styles", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=250",
            Arrays.asList(
                new SeedSubCategory("Tops & T-Shirts", new SeedProduct("Premium Cotton Tee", "Breathable 100% organic cotton t-shirt for daily comfort", 1499.00, 799.00, "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400", "H&M", "White", "M", 3)),
                new SeedSubCategory("Dresses", new SeedProduct("Summer Floral Dress", "Elegant floral printed summer dress with lightweight feel", 2999.00, 1499.00, "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400", "Mango", "Blue", "S", 4)),
                new SeedSubCategory("Bottom Wear", new SeedProduct("Slim Fit Denim Jeans", "Classic dark wash stretchable slim fit denim jeans", 3499.00, 1999.00, "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400", "Levi's", "Blue", "32", 3)),
                new SeedSubCategory("Ethnic Wear", new SeedProduct("Traditional Kurta Set", "Beautiful traditional cotton printed kurta set for festive wear", 4999.00, 2999.00, "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400", "Fabindia", "Orange", "M", 5)),
                new SeedSubCategory("Winter Wear", new SeedProduct("Knit Woolen Sweater", "Cozy winter sweater made of premium insulating wool", 3999.00, 2499.00, "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400", "Allen Solly", "Grey", "XL", 4)),
                new SeedSubCategory("Activewear", new SeedProduct("Athletic Gym Tights", "High-waist moisture-wicking active compression tights", 2499.00, 1299.00, "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=400", "Nike", "Black", "M", 3)),
                new SeedSubCategory("Loungewear", new SeedProduct("Cozy Pyjama Set", "Super soft cotton pyjama and tee nightwear lounge set", 1999.00, 1199.00, "https://images.unsplash.com/photo-1562572159-4ebcd318f4dd?q=80&w=400", "Marks & Spencer", "Pink", "M", 3)),
                new SeedSubCategory("Co-ord Sets", new SeedProduct("Linen Co-ord Set", "Stylish matching linen top and trousers set for summer", 3999.00, 2199.00, "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=400", "Zara", "Beige", "S", 4))
            )
        ));

        // 2. Jewellery & Accessories
        categories.add(new SeedCategory(
            "Jewellery & Accessories", "Elegant jewellery and premium accessories", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=250",
            Arrays.asList(
                new SeedSubCategory("Earrings", new SeedProduct("Silver Hoop Earrings", "Classic sterling silver hoop earrings for daily wear", 1999.00, 999.00, "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400", "Giva", "Silver", "One Size", 3)),
                new SeedSubCategory("Necklaces", new SeedProduct("Gold Plated Pendant Necklace", "Minimalist gold plated chain with circular pendant", 2999.00, 1499.00, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400", "Caratlane", "Gold", "One Size", 4)),
                new SeedSubCategory("Bracelets", new SeedProduct("Beaded Charm Bracelet", "Delicate charm bracelet with crystal beads", 1499.00, 799.00, "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400", "Pandora", "Rose Gold", "One Size", 3)),
                new SeedSubCategory("Rings", new SeedProduct("Classic Solitaire Ring", "Elegant cubic zirconia solitaire ring in silver", 2499.00, 1199.00, "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400", "Giva", "Silver", "7", 3)),
                new SeedSubCategory("Watches", new SeedProduct("Minimalist Leather Watch", "Classic analog watch with brown leather strap", 5999.00, 3499.00, "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400", "Fossil", "Brown", "One Size", 3)),
                new SeedSubCategory("Bags", new SeedProduct("Leather Tote Bag", "Spacious genuine leather tote bag with zip closure", 4999.00, 2999.00, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400", "Baggit", "Tan", "One Size", 4)),
                new SeedSubCategory("Hair Accessories", new SeedProduct("Silk Scrunchies Set", "Pack of 5 pure mulberry silk hair scrunchies", 999.00, 499.00, "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?q=80&w=400", "Accessorize", "Pink", "One Size", 2)),
                new SeedSubCategory("Sunglasses", new SeedProduct("Classic Aviator Sunglasses", "UV protected aviator sunglasses with gold frame", 3999.00, 1999.00, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400", "Ray-Ban", "Black", "One Size", 3))
            )
        ));

        // 3. Footwear
        categories.add(new SeedCategory(
            "Footwear", "Stylish footwear for men, women and kids", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=250",
            Arrays.asList(
                new SeedSubCategory("Sneakers", new SeedProduct("Classic White Sneakers", "Low-top white sneakers with comfortable cushioned sole", 4999.00, 2999.00, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400", "Puma", "White", "8 UK", 3)),
                new SeedSubCategory("Flats", new SeedProduct("Comfortable Ballet Flats", "Soft slip-on ballet flats perfect for daily office wear", 1999.00, 999.00, "https://images.unsplash.com/photo-1596702994230-a8859ad8db29?q=80&w=400", "Bata", "Black", "6 UK", 3)),
                new SeedSubCategory("Heels", new SeedProduct("Elegant Stiletto Heels", "Pointed toe stiletto heels for parties and evening wear", 3999.00, 2299.00, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400", "Carlton London", "Nude", "7 UK", 4)),
                new SeedSubCategory("Sandals", new SeedProduct("Strappy Casual Sandals", "Comfortable everyday wear strappy flat sandals", 1499.00, 799.00, "https://images.unsplash.com/photo-1603487265291-7493b8f68224?q=80&w=400", "Crocs", "Tan", "8 UK", 2)),
                new SeedSubCategory("Boots", new SeedProduct("Ankle Length Leather Boots", "Stylish chelsea ankle boots with block heel", 5999.00, 3499.00, "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=400", "Woodland", "Brown", "9 UK", 5)),
                new SeedSubCategory("Loafers", new SeedProduct("Classic Suede Loafers", "Slip-on suede leather loafers for a smart-casual look", 3499.00, 1999.00, "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=400", "Clarks", "Blue", "8 UK", 4)),
                new SeedSubCategory("Slippers", new SeedProduct("Orthopedic Soft Slippers", "Orthopedic cushion slippers for active home use", 999.00, 499.00, "https://images.unsplash.com/photo-1603487265291-7493b8f68224?q=80&w=400", "Doctor Extra Soft", "Blue", "7 UK", 3)),
                new SeedSubCategory("Sports Shoes", new SeedProduct("Pro Running Shoes", "Comfortable and durable sports shoes for active running", 5999.00, 3499.00, "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400", "Nike", "Grey", "8 UK", 3))
            )
        ));

        // 4. Electronics
        categories.add(new SeedCategory(
            "Electronics", "Smart gadgets and electronics", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=250",
            Arrays.asList(
                new SeedSubCategory("Mobile Accessories", new SeedProduct("Magnetic Phone Mount", "Universal air vent magnetic car phone mount holder", 999.00, 499.00, "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=400", "Portronics", "Black", "One Size", 2)),
                new SeedSubCategory("Audio Devices", new SeedProduct("Wireless Bluetooth Earbuds", "Bluetooth 5.3 wireless earbuds with active noise cancelation", 3999.00, 1799.00, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400", "boAt", "White", "One Size", 2)),
                new SeedSubCategory("Smart Watches", new SeedProduct("Smart Fitness Watch", "Smart watch with AMOLED display & bluetooth calling", 7999.00, 3999.00, "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400", "Noise", "Black", "One Size", 3)),
                new SeedSubCategory("Laptop Accessories", new SeedProduct("Multi-port USB-C Hub", "6-in-1 USB C hub with HDMI port and SD card slot", 2499.00, 1299.00, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=400", "Anker", "Grey", "One Size", 2)),
                new SeedSubCategory("Gaming Accessories", new SeedProduct("RGB Gaming Mouse", "Wired gaming mouse with 12000 DPI adjustable sensor", 1999.00, 999.00, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=400", "Logitech", "Black", "One Size", 3)),
                new SeedSubCategory("Smart Home Devices", new SeedProduct("Smart Wi-Fi Plug", "16A smart plug with energy monitoring, Alexa compatible", 1999.00, 899.00, "https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=400", "Wipro", "White", "One Size", 3)),
                new SeedSubCategory("Power Banks", new SeedProduct("20000mAh Power Bank", "20W fast charging power bank with triple output ports", 2499.00, 1499.00, "https://images.unsplash.com/photo-1609592424083-d922a91a92e9?q=80&w=400", "Mi", "Blue", "One Size", 2)),
                new SeedSubCategory("Cables & Chargers", new SeedProduct("Braided USB-C Cable", "Type C to Type C 6ft fast charging braided nylon cable", 699.00, 349.00, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=400", "Anker", "Black", "6ft", 2))
            )
        ));

        // 5. Stationery
        categories.add(new SeedCategory(
            "Stationery", "Notebooks, pens and office essentials", "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=250",
            Arrays.asList(
                new SeedSubCategory("Notebooks", new SeedProduct("Hardcover Journal", "Premium 120 GSM dotted journal notebook with pocket", 899.00, 499.00, "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400", "Matrikas", "Black", "A5", 3)),
                new SeedSubCategory("Pens & Pencils", new SeedProduct("Fine Tip Gel Pens Set", "Pack of 12 black fine tip gel ink pens", 599.00, 299.00, "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=400", "Pilot", "Black", "Pack of 12", 2)),
                new SeedSubCategory("Art Supplies", new SeedProduct("Water Color Paints Set", "24 vibrant colors watercolor tubes with mixing palette", 1499.00, 899.00, "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=400", "Camel", "Multicolor", "24 Colors", 3)),
                new SeedSubCategory("Desk Organizers", new SeedProduct("Mesh Desk Organizer", "Multi-functional metal desk pen holder and storage tidy", 999.00, 499.00, "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?q=80&w=400", "Deli", "Black", "One Size", 3)),
                new SeedSubCategory("Journals", new SeedProduct("Leather Bound Diary", "Vintage handmade leather pocket journal diary book", 1299.00, 699.00, "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400", "Craftsmen", "Brown", "A6", 4)),
                new SeedSubCategory("Planners", new SeedProduct("Dated Daily Planner", "A5 size dated daily and weekly goal-setting planner book", 1199.00, 699.00, "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=400", "Neorah", "Teal", "A5", 3)),
                new SeedSubCategory("Sticky Notes", new SeedProduct("Sticky Notes Pad Set", "Self-adhesive multi-color neon sticky notes pack", 399.00, 199.00, "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400", "3M Post-it", "Multicolor", "3x3 in", 2)),
                new SeedSubCategory("Office Supplies", new SeedProduct("Heavy Duty Stapler", "25 sheets capacity desk stapler with staples pack", 499.00, 249.00, "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400", "Kangaroo", "Grey", "Medium", 3))
            )
        ));

        // 6. Kids & Baby
        categories.add(new SeedCategory(
            "Kids & Baby", "Toys and baby care products", "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=250",
            Arrays.asList(
                new SeedSubCategory("Baby Clothing", new SeedProduct("Cotton Rompers", "Pack of 3 super soft organic cotton snap button rompers", 1499.00, 799.00, "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400", "Luvlap", "Pastel Prints", "0-3 Months", 3)),
                new SeedSubCategory("Kids Clothing", new SeedProduct("Casual Tee & Shorts", "Unisex casual cotton printed tee and comfortable denim shorts", 1999.00, 999.00, "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400", "FirstCry", "Blue", "4-5 Years", 3)),
                new SeedSubCategory("Toys", new SeedProduct("Wooden Stacking Blocks", "Safe non-toxic wooden stacking blocks for toddler learning", 1299.00, 699.00, "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=400", "Funskool", "Multicolor", "One Size", 4)),
                new SeedSubCategory("Baby Care", new SeedProduct("Gentle Baby Wipes", "Pack of 3 gentle water-based unscented baby wipes", 599.00, 349.00, "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400", "Himalaya", "White", "Pack of 3", 2)),
                new SeedSubCategory("School Essentials", new SeedProduct("School Backpack", "Lightweight water resistant school bag with multiple compartments", 1999.00, 999.00, "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=400", "Skybags", "Red", "Standard", 3)),
                new SeedSubCategory("Feeding Essentials", new SeedProduct("Silicone Feeding Bottle", "Premium quality silicone nipple feeding bottle 240ml", 799.00, 449.00, "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400", "Pigeon", "Clear", "240ml", 2)),
                new SeedSubCategory("Baby Bedding", new SeedProduct("Baby Mosquito Net Bed", "Comfortable soft padded mattress with protective mosquito net", 1499.00, 799.00, "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400", "Mee Mee", "Pink", "One Size", 3)),
                new SeedSubCategory("Kids Footwear", new SeedProduct("Kids Light-Up Sneakers", "Slip-resistant velcro closure sneakers with LED lights", 1799.00, 899.00, "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=400", "Liberty", "Red", "10 Kids", 3))
            )
        ));

        // 7. Health & Wellness
        categories.add(new SeedCategory(
            "Health & Wellness", "Fitness, vitamins and health care", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=250",
            Arrays.asList(
                new SeedSubCategory("Vitamins & Supplements", new SeedProduct("Multivitamin Capsules", "Daily multivitamin with zinc, vitamin C & D3 (60 capsules)", 999.00, 499.00, "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=400", "MuscleBlaze", "Amber", "60 Tablets", 3)),
                new SeedSubCategory("Fitness Equipment", new SeedProduct("Resistance Bands Set", "Stackable loop exercise bands with handles and door anchor", 1499.00, 799.00, "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400", "Boldfit", "Multicolor", "5-Piece Set", 3)),
                new SeedSubCategory("Personal Care", new SeedProduct("Charcoal Hand Wash", "Anti-bacterial organic activated charcoal hand wash liquid", 499.00, 299.00, "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=400", "Dettol", "Black", "500ml", 2)),
                new SeedSubCategory("Yoga Essentials", new SeedProduct("TPE Yoga Mat", "6mm thick high-density anti-slip yoga mat with carry strap", 1999.00, 1199.00, "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=400", "Boldfit", "Purple", "One Size", 3)),
                new SeedSubCategory("Healthy Snacks", new SeedProduct("Almonds & Berries Mix", "Gluten-free nutrient-dense trail mix dry fruits pack", 799.00, 499.00, "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=400", "True Elements", "Brown", "250g", 2)),
                new SeedSubCategory("Massagers", new SeedProduct("Handheld Body Massager", "Deep tissue percussion massager with multiple speed settings", 2999.00, 1799.00, "https://images.unsplash.com/photo-1519823551276-6452893fea23?q=80&w=400", "Dr. Trust", "Grey", "One Size", 4)),
                new SeedSubCategory("Health Monitors", new SeedProduct("Digital BP Monitor", "Fully automatic upper arm BP monitor with large display", 2499.00, 1499.00, "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=400", "Omron", "Grey", "One Size", 3)),
                new SeedSubCategory("Wellness Kits", new SeedProduct("Immunity Booster Box", "Assorted collection of green teas, organic honey & supplements", 1999.00, 1199.00, "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400", "Organic India", "Gold", "Standard", 4))
            )
        ));

        // 8. Sports
        categories.add(new SeedCategory(
            "Sports", "Sporting goods and shoes", "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=250",
            Arrays.asList(
                new SeedSubCategory("Cricket", new SeedProduct("Willow Cricket Bat", "Grade-A english willow cricket bat with dynamic rubber grip", 9999.00, 5999.00, "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=400", "SG", "Wood", "Short Handle", 5)),
                new SeedSubCategory("Football", new SeedProduct("Soccer Football Size 5", "Professional machine-stitched training football size 5", 1499.00, 799.00, "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400", "Nivia", "Black/White", "5", 3)),
                new SeedSubCategory("Badminton", new SeedProduct("Graphite Rackets Pair", "High-tension lightweight graphite rackets with 6 shuttles", 3999.00, 2199.00, "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=400", "Yonex", "Blue", "One Size", 3)),
                new SeedSubCategory("Gym Equipment", new SeedProduct("Dumbbells 20kg Set", "PVC plate dumbbells set with steel rods and locks", 3999.00, 1999.00, "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=400", "Kore", "Black", "20kg Set", 6)),
                new SeedSubCategory("Cycling", new SeedProduct("Mountain Bicycle 27.5T", "27.5-inch wheel alloy frame mountain bike with suspension", 18999.00, 12999.00, "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=400", "Hero", "Black", "27.5 T", 7)),
                new SeedSubCategory("Running Gear", new SeedProduct("Running Waist Pouch", "Waterproof running waist pouch with dual bottle holders", 1299.00, 599.00, "https://images.unsplash.com/photo-1447049959918-d5743c95977c?q=80&w=400", "Decathlon", "Grey", "Adjustable", 3)),
                new SeedSubCategory("Outdoor Games", new SeedProduct("Wooden Carrom Board", "32-inch carrom board with coins, striker & powder set", 2999.00, 1799.00, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=400", "Precise", "Brown", "32-Inch", 5)),
                new SeedSubCategory("Sports Accessories", new SeedProduct("Tension Resistance Band", "Heavy resistance pull-up assist band for workouts", 899.00, 449.00, "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400", "Strauss", "Red", "Heavy", 2))
            )
        ));

        // 9. Pets
        categories.add(new SeedCategory(
            "Pets", "Supplies and food for your lovely pets", "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=250",
            Arrays.asList(
                new SeedSubCategory("Dog Supplies", new SeedProduct("Padded Dog Harness", "No-pull outdoor reflective oxford fabric chest harness", 1499.00, 799.00, "https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=400", "Heads Up For Tails", "Red", "L", 3)),
                new SeedSubCategory("Cat Supplies", new SeedProduct("Hemp Cat Scratching Post", "Durable cat scratching tree post with hanging play ball", 1999.00, 999.00, "https://images.unsplash.com/photo-1545249390-6bdfa286032f?q=80&w=400", "Trixie", "Beige", "Medium", 4)),
                new SeedSubCategory("Pet Food", new SeedProduct("Dry Dog Kibble", "Chicken and vegetables formula dry food for adult dogs 3kg", 1299.00, 999.00, "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=400", "Royal Canin", "Brown", "3kg", 3)),
                new SeedSubCategory("Treats", new SeedProduct("Chicken Dog Treats", "Grain-free natural calcium rich dog chew bones", 599.00, 399.00, "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=400", "Pedigree", "Yellow", "150g", 2)),
                new SeedSubCategory("Toys", new SeedProduct("Squeaky Dog Ball", "Indestructible non-toxic natural rubber treat dispenser ball", 499.00, 299.00, "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=400", "Kong", "Red", "M", 2)),
                new SeedSubCategory("Grooming", new SeedProduct("Pet Deshedding Tool", "Stainless steel dual-sided undercoat rake for dogs and cats", 999.00, 499.00, "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=400", "Wahl", "Green", "Standard", 3)),
                new SeedSubCategory("Beds & Mats", new SeedProduct("Memory Foam Pet Bed", "Ultra-soft bolster orthopaedic sleeping bed for large pets", 3999.00, 2299.00, "https://images.unsplash.com/photo-1541599540903-216a46ca1ad0?q=80&w=400", "HUFT", "Grey", "L", 4)),
                new SeedSubCategory("Bowls & Feeders", new SeedProduct("Double Pet Bowl Set", "Non-spill silicone mat double bowls for food and water", 1199.00, 599.00, "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=400", "SuperDog", "Black", "Medium", 3))
            )
        ));

        // 10. Home & Living
        categories.add(new SeedCategory(
            "Home & Living", "Beautiful essentials for every room and home decor", "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=250",
            Arrays.asList(
                new SeedSubCategory("Home Decor", new SeedProduct("Handcrafted Ceramic Vase", "Minimalist white glazed ceramic flower pot vase", 1999.00, 1199.00, "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=400", "Ellementry", "White", "One Size", 4)),
                new SeedSubCategory("Kitchen Essentials", new SeedProduct("Knife Set 5-Piece", "5-piece high-carbon stainless steel knife set with wooden block", 2999.00, 1699.00, "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=400", "Pigeon", "Silver", "5-Piece Set", 3)),
                new SeedSubCategory("Dining", new SeedProduct("Porcelain Dinner Set", "18-piece fine ceramic dining plate and bowl collection", 5999.00, 3499.00, "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=400", "Clay Craft", "White", "18-Piece", 4)),
                new SeedSubCategory("Bedding", new SeedProduct("Double Cotton Bedsheet", "Breathable 210 TC floral printed cotton bedsheet with 2 pillowcases", 2499.00, 1299.00, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=400", "Portico New York", "Blue", "King Size", 3)),
                new SeedSubCategory("Storage & Organization", new SeedProduct("Wardrobe Organizers 3-Pack", "Set of 3 non-woven fabric underwear and sock dividers", 999.00, 499.00, "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?q=80&w=400", "Kuber Industries", "Grey", "3-Pack", 2)),
                new SeedSubCategory("Lighting", new SeedProduct("Hanging Pendant Light", "Vintage industrial metallic cage ceiling pendant lamp", 1999.00, 999.00, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=400", "Philips", "Black", "Medium", 3)),
                new SeedSubCategory("Furniture", new SeedProduct("Wood End Table", "Compact modern bedside lamp table with storage shelf", 7999.00, 4499.00, "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=400", "Urban Ladder", "Brown", "Standard", 6)),
                new SeedSubCategory("Bath Essentials", new SeedProduct("Bath Towels 2-Pack", "Set of 2 ultra absorbent 600 GSM combed cotton bath towels", 1999.00, 999.00, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=400", "Spaces", "Blue", "70x140 cm", 3))
            )
        ));

        // 11. Beauty
        categories.add(new SeedCategory(
            "Beauty", "Cosmetics and perfumes", "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=250",
            Arrays.asList(
                new SeedSubCategory("Skincare", new SeedProduct("Organic Vitamin C Serum", "Anti-aging glowing skin serum with vitamin C, E & hyaluronic acid", 1499.00, 799.00, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400", "Mamaearth", "Orange", "30ml", 2)),
                new SeedSubCategory("Makeup", new SeedProduct("Matte Liquid Lipstick", "Longwear transfer-proof intense red liquid lipstick", 999.00, 599.00, "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=400", "Lakme", "Red", "One Size", 2)),
                new SeedSubCategory("Hair Care", new SeedProduct("Argan Oil Hair Mask", "Deep conditioning hair repair mask for dry and damaged hair", 1199.00, 699.00, "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400", "L'Oreal Professional", "Gold", "200ml", 3)),
                new SeedSubCategory("Fragrances", new SeedProduct("Luxury Eau De Parfum", "Warm woody and citrusy signature long-lasting fragrance", 4999.00, 2999.00, "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400", "Fogg", "Gold", "100ml", 3)),
                new SeedSubCategory("Bath & Body", new SeedProduct("Cocoa Body Butter", "Deeply moisturizing cocoa butter cream for dry skin", 899.00, 499.00, "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=400", "The Body Shop", "Brown", "200ml", 3)),
                new SeedSubCategory("Nail Care", new SeedProduct("Gel Nail Lacquer Set", "Set of 3 long-lasting high shine gel nail polishes", 699.00, 399.00, "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400", "Nykaa", "Pink", "Pack of 3", 2)),
                new SeedSubCategory("Beauty Tools", new SeedProduct("Sonic Facial Cleansing Brush", "Waterproof sonic face massager and pore exfoliator tool", 2499.00, 1499.00, "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400", "Foreo", "Pink", "One Size", 3)),
                new SeedSubCategory("Men's Grooming", new SeedProduct("Beard Growth Oil", "Natural oil for beard growth, nourishment, and softness", 599.00, 349.00, "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=400", "The Man Company", "Amber", "50ml", 2))
            )
        ));

        return categories;
    }

    private static class SeedCategory {
        String name;
        String description;
        String image;
        List<SeedSubCategory> subcategories;

        public SeedCategory(String name, String description, String image, List<SeedSubCategory> subcategories) {
            this.name = name;
            this.description = description;
            this.image = image;
            this.subcategories = subcategories;
        }
    }

    private static class SeedSubCategory {
        String name;
        SeedProduct product;

        public SeedSubCategory(String name, SeedProduct product) {
            this.name = name;
            this.product = product;
        }
    }

    private static class SeedProduct {
        String title;
        String description;
        BigDecimal mrp;
        BigDecimal sellingPrice;
        String image;
        String brand;
        String color;
        String size;
        int deliveryDays;

        public SeedProduct(String title, String description, double mrp, double sellingPrice, String image, String brand, String color, String size, int deliveryDays) {
            this.title = title;
            this.description = description;
            this.mrp = BigDecimal.valueOf(mrp);
            this.sellingPrice = BigDecimal.valueOf(sellingPrice);
            this.image = image;
            this.brand = brand;
            this.color = color;
            this.size = size;
            this.deliveryDays = deliveryDays;
        }
    }
}
