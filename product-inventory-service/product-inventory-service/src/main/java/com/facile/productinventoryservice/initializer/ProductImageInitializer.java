package com.facile.productinventoryservice.initializer;

import com.facile.productinventoryservice.model.Product;
import com.facile.productinventoryservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Component
@Order(15)
@RequiredArgsConstructor
public class ProductImageInitializer implements CommandLineRunner {
    private static final String UNSPLASH = "https://images.unsplash.com/";

    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String... args) {
        for (Product product : productRepository.findAll()) {
            String photoId = resolvePhotoId(product);
            List<String> images = imageVariants(photoId);
            if (!images.equals(product.getImages()) || !images.getFirst().equals(product.getImage())) {
                product.setImage(images.getFirst());
                product.setImages(images);
            }
        }
        productRepository.flush();
        System.out.println("[ProductImageInitializer] Repaired product images with stable matched URLs.");
    }

    private List<String> imageVariants(String photoId) {
        String base = UNSPLASH + photoId + "?auto=format&fit=crop&q=82";
        return List.of(
                base + "&w=900&h=900",
                base + "&w=1200&h=900",
                base + "&w=900&h=1200",
                base + "&w=1400&h=1050"
        );
    }

    private String resolvePhotoId(Product product) {
        String text = (product.getTitle() + " " + product.getSubCategory().getName()).toLowerCase(Locale.ROOT);

        if (has(text, "sneaker", "running shoe", "sports shoe")) return "photo-1542291026-7eec264c27ff";
        if (has(text, "heel", "stiletto")) return "photo-1543163521-1bf539c55dd2";
        if (has(text, "boot")) return "photo-1608256246200-53e635b5b65f";
        if (has(text, "shoe", "loafer", "slipper", "sandal", "flat")) return "photo-1608231387042-66d1773070a5";
        if (has(text, "earbud")) return "photo-1590658268037-6bf12165a8df";
        if (has(text, "headphone", "audio")) return "photo-1546435770-a3e426bf472b";
        if (has(text, "speaker")) return "photo-1608043152269-423dbba4e7e1";
        if (has(text, "watch", "fitness band")) return "photo-1546868871-7041f2a55e12";
        if (has(text, "mouse", "keyboard", "gaming")) return "photo-1615663245857-ac93bb7c39e7";
        if (has(text, "charger", "cable", "usb", "power bank")) return "photo-1583863788434-e58a36330cf0";
        if (has(text, "perfume", "fragrance")) return "photo-1523293182086-7651a899d37f";
        if (has(text, "serum", "skincare", "moisturizer", "sunscreen")) return "photo-1620916566398-39f1143ab7be";
        if (has(text, "lipstick", "makeup")) return "photo-1586495777744-4413f21062fa";
        if (has(text, "hair", "beard", "oil")) return "photo-1608571423902-eed4a5ad8108";
        if (has(text, "shirt", "tee", "t-shirt", "top")) return "photo-1521572267360-ee0c2909d518";
        if (has(text, "jean", "denim", "trouser", "bottom")) return "photo-1542272604-787c3835535d";
        if (has(text, "dress")) return "photo-1595777457583-95e059d581b8";
        if (has(text, "kurta", "ethnic")) return "photo-1583391733956-3750e0ff4e8b";
        if (has(text, "sweater", "winter", "jacket")) return "photo-1556905055-8f358a7a47b2";
        if (has(text, "bag", "backpack", "tote")) return "photo-1584917865442-de89df76afd3";
        if (has(text, "ring", "necklace", "earring", "bracelet", "jewellery")) return "photo-1599643478518-a784e5dc4c8f";
        if (has(text, "toy", "block", "teddy", "baby")) return "photo-1513364776144-60967b0f800f";
        if (has(text, "dog", "cat", "pet")) return "photo-1543466835-00a7907e9de1";
        if (has(text, "yoga", "fitness", "gym", "dumbbell", "resistance")) return "photo-1517838277536-f5f99be501cd";
        if (has(text, "cricket")) return "photo-1531415074968-036ba1b575da";
        if (has(text, "football")) return "photo-1461896836934-ffe607ba8211";
        if (has(text, "badminton")) return "photo-1626224583764-f87db24ac4ea";
        if (has(text, "bicycle", "cycling")) return "photo-1485965120184-e220f721d03e";
        if (has(text, "notebook", "journal", "planner", "stationery", "pen")) return "photo-1586075010923-2dd4570fb338";
        if (has(text, "paint", "art")) return "photo-1513364776144-60967b0f800f";
        if (has(text, "lamp", "light")) return "photo-1507473885765-e6ed057f782c";
        if (has(text, "vase", "decor")) return "photo-1578500494198-246f612d3b3d";
        if (has(text, "bed", "sheet", "towel", "cushion")) return "photo-1578500494198-246f612d3b3d";
        if (has(text, "kitchen", "knife", "pan", "cookware", "dining")) return "photo-1584269600464-37b1b58a9fe7";

        return switch (product.getCategory().getName().toLowerCase(Locale.ROOT)) {
            case "fashion" -> "photo-1521572267360-ee0c2909d518";
            case "beauty" -> "photo-1571781926291-c477ebfd024b";
            case "footwear" -> "photo-1542291026-7eec264c27ff";
            case "electronics" -> "photo-1498049794561-7780e7231661";
            case "stationery" -> "photo-1586075010923-2dd4570fb338";
            case "home & living" -> "photo-1578500494198-246f612d3b3d";
            case "sports" -> "photo-1461896836934-ffe607ba8211";
            default -> "photo-1493723843671-1d655e66ac1c";
        };
    }

    private boolean has(String text, String... terms) {
        for (String term : terms) {
            if (text.contains(term)) return true;
        }
        return false;
    }
}
