package com.facile.productinventoryservice.initializer;

import com.facile.productinventoryservice.model.Product;
import com.facile.productinventoryservice.model.ProductReview;
import com.facile.productinventoryservice.repository.ProductRepository;
import com.facile.productinventoryservice.repository.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(20)
@RequiredArgsConstructor
public class DemoReviewInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final ProductReviewRepository reviewRepository;

    @Value("${app.seed-demo-reviews:true}")
    private boolean seedDemoReviews;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDemoReviews) {
            return;
        }

        for (Product product : productRepository.findAll()) {
            // Leave every fifth product unrated so the "No reviews" state remains testable.
            if (product.getId() % 5 == 0 || reviewRepository.countByProductId(product.getId()) > 0) {
                continue;
            }
            reviewRepository.saveAll(buildReviews(product));
        }
    }

    private List<ProductReview> buildReviews(Product product) {
        String productName = product.getTitle();
        int[][] ratingMixes = {
                {5, 5, 3, 2}, // mostly positive: 3.8
                {5, 4, 2, 1}, // mixed: 3.0
                {5, 3, 1, 1}, // mostly negative: 2.5
                {5, 4, 3, 1}  // positive with one bad review: 3.3
        };
        int[] ratings = ratingMixes[(int) (product.getId() % ratingMixes.length)];
        return List.of(
                review(product, "Aarav Mehta", "demo.aarav+" + product.getId() + "@facile.test", ratings[0],
                        "Excellent purchase", productName + " exceeded my expectations. The quality feels excellent and I would happily recommend it."),
                review(product, "Meera Shah", "demo.meera+" + product.getId() + "@facile.test", ratings[1],
                        "Good overall", "I am happy with " + productName + ". It works as described, though the packaging and delivery experience could be better."),
                review(product, "Kabir Singh", "demo.kabir+" + product.getId() + "@facile.test", ratings[2],
                        "Disappointing experience", productName + " did not fully match my expectations. The finish felt average and the value could be improved."),
                review(product, "Riya Nair", "demo.riya+" + product.getId() + "@facile.test", ratings[3],
                        "Would not recommend", "Unfortunately, I had a poor experience with " + productName + ". The item did not feel worth the price."));
    }

    private ProductReview review(
            Product product,
            String userName,
            String userEmail,
            int rating,
            String title,
            String comment) {
        return ProductReview.builder()
                .product(product)
                .userName(userName)
                .userEmail(userEmail)
                .rating(rating)
                .title(title)
                .comment(comment)
                .build();
    }
}
