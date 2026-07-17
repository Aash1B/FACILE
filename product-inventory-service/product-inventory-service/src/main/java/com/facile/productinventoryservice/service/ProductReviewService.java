package com.facile.productinventoryservice.service;

import com.facile.productinventoryservice.dto.ProductReviewRequest;
import com.facile.productinventoryservice.model.Product;
import com.facile.productinventoryservice.model.ProductReview;
import com.facile.productinventoryservice.repository.ProductRepository;
import com.facile.productinventoryservice.repository.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductReviewService {
    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public List<ProductReview> getReviews(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new IllegalArgumentException("Product not found");
        }
        return reviewRepository.findByProductIdOrderByUpdatedAtDesc(productId);
    }

    public List<ProductReview> getReviewsByUserEmail(String email) {
        return reviewRepository.findByUserEmailIgnoreCaseOrderByUpdatedAtDesc(email);
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void reconcileProductRatings() {
        productRepository.findAll().forEach(this::refreshProductRating);
    }

    @Transactional
    public ProductReview saveReview(Long productId, ProductReviewRequest request, String authorization) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        AuthenticatedUser user = authenticate(authorization);
        verifyPurchase(user.email(), productId);

        ProductReview review = reviewRepository
                .findByProductIdAndUserEmailIgnoreCase(productId, user.email())
                .orElseGet(() -> ProductReview.builder().product(product).build());
        review.setUserId(user.id());
        review.setUserName(user.name());
        review.setUserEmail(user.email());
        review.setRating(request.getRating());
        review.setTitle(request.getTitle() == null ? null : request.getTitle().trim());
        review.setComment(request.getComment().trim());
        ProductReview saved = reviewRepository.saveAndFlush(review);

        refreshProductRating(product);
        return saved;
    }

    private void refreshProductRating(Product product) {
        long count = reviewRepository.countByProductId(product.getId());
        Double average = reviewRepository.averageRating(product.getId());
        product.setReviews(Math.toIntExact(count));
        product.setRating(BigDecimal.valueOf(average == null ? 0 : average)
                .setScale(1, RoundingMode.HALF_UP).doubleValue());
        productRepository.save(product);
    }

    private AuthenticatedUser authenticate(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new SecurityException("You must sign in to submit a review");
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.AUTHORIZATION, authorization);
            ResponseEntity<AuthenticatedUser> response = new RestTemplate().exchange(
                    "http://localhost:8082/api/auth/me",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    AuthenticatedUser.class);
            AuthenticatedUser user = response.getBody();
            if (user == null || user.email() == null) {
                throw new SecurityException("Invalid user session");
            }
            return new AuthenticatedUser(user.id(), user.name(), user.email().trim().toLowerCase());
        } catch (SecurityException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new SecurityException("Your session could not be verified");
        }
    }

    private void verifyPurchase(String email, Long productId) {
        String url = UriComponentsBuilder
                .fromHttpUrl("http://localhost:8081/api/orders/review-eligibility")
                .queryParam("userId", email)
                .queryParam("productId", productId)
                .toUriString();
        try {
            PurchaseEligibility eligibility = new RestTemplate().getForObject(url, PurchaseEligibility.class);
            if (eligibility == null || !eligibility.eligible()) {
                throw new SecurityException("Only customers who purchased this product can review it");
            }
        } catch (SecurityException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new IllegalStateException("Purchase history is temporarily unavailable");
        }
    }

    private record AuthenticatedUser(Long id, String name, String email) {}
    private record PurchaseEligibility(boolean eligible) {}
}
