package com.facile.productinventoryservice.controller;

import com.facile.productinventoryservice.model.ProductReview;
import com.facile.productinventoryservice.service.ProductReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user/reviews")
@RequiredArgsConstructor
public class UserReviewController {
    private final ProductReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ProductReview>> getUserReviews(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(reviewService.getReviewsByUserEmail(email));
    }
}
