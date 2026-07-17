package com.facile.productinventoryservice.controller;

import com.facile.productinventoryservice.dto.ProductReviewRequest;
import com.facile.productinventoryservice.model.ProductReview;
import com.facile.productinventoryservice.service.ProductReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ProductReviewController {
    private final ProductReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ProductReview>> getReviews(@PathVariable Long productId) {
        try {
            return ResponseEntity.ok(reviewService.getReviews(productId));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ProductReview> saveReview(
            @PathVariable Long productId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @Valid @RequestBody ProductReviewRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.saveReview(productId, request, authorization));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
}
