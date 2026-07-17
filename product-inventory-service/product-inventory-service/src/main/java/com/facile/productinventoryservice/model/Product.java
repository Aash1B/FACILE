package com.facile.productinventoryservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal mrp;

    @Column(name = "selling_price", nullable = false)
    private BigDecimal sellingPrice;

    @Column(columnDefinition = "TEXT")
    private String image;

    @Column(name = "seller_email")
    private String sellerEmail;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    @OrderColumn(name = "display_order")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sub_category_id", nullable = false)
    private SubCategory subCategory;

    @Builder.Default
    @Column(nullable = false)
    private Double rating = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private Integer reviews = 0;

    // ── New filterable attributes ─────────────────────────────────────────────

    /** e.g. "Sony", "Nike", "Lakme" */
    private String brand;

    /** e.g. "Black", "White", "Red", "Blue" */
    private String color;

    /** e.g. "S", "M", "L", "XL", "One Size", "6 UK" */
    private String size;

    /** Estimated delivery in calendar days (1–7+) */
    @Column(name = "delivery_days")
    private Integer deliveryDays;

    @Builder.Default
    @Column(name = "max_order_quantity")
    private Integer maxOrderQuantity = 10;
}
