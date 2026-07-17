package com.facile.productinventoryservice.repository;

import com.facile.productinventoryservice.model.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProductIdOrderByUpdatedAtDesc(Long productId);
    Optional<ProductReview> findByProductIdAndUserEmailIgnoreCase(Long productId, String userEmail);
    List<ProductReview> findByUserEmailIgnoreCaseOrderByUpdatedAtDesc(String userEmail);
    long countByProductId(Long productId);

    @Query("select avg(r.rating) from ProductReview r where r.product.id = :productId")
    Double averageRating(@Param("productId") Long productId);
}
