package com.facile.productinventoryservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_reviews", uniqueConstraints =
        @UniqueConstraint(name = "uk_product_review_user", columnNames = {"product_id", "user_email"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_name", nullable = false, length = 120)
    private String userName;

    @Column(name = "user_email", nullable = false, length = 255)
    private String userEmail;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 120)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
