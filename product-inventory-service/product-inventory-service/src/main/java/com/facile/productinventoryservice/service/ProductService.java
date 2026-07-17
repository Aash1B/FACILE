package com.facile.productinventoryservice.service;

import com.facile.productinventoryservice.dto.ProductImageUpdateRequest;
import com.facile.productinventoryservice.model.Product;
import com.facile.productinventoryservice.model.Inventory;
import com.facile.productinventoryservice.repository.ProductRepository;
import com.facile.productinventoryservice.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> getProductsBySubCategory(Long subCategoryId) {
        return productRepository.findBySubCategoryId(subCategoryId);
    }

    @Transactional
    public Product createProduct(Product product, Integer initialStock) {
        if (product.getMaxOrderQuantity() == null || product.getMaxOrderQuantity() < 1) {
            product.setMaxOrderQuantity(10);
        }
        Product savedProduct = productRepository.save(product);
        
        Inventory inventory = Inventory.builder()
                .productId(savedProduct.getId())
                .stock(initialStock != null ? initialStock : 0)
                .build();
        inventoryRepository.save(inventory);
        
        return savedProduct;
    }

    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setTitle(updatedProduct.getTitle());
                    product.setDescription(updatedProduct.getDescription());
                    product.setMrp(updatedProduct.getMrp());
                    product.setSellingPrice(updatedProduct.getSellingPrice());
                    product.setImage(updatedProduct.getImage());
                    product.setCategory(updatedProduct.getCategory());
                    product.setSubCategory(updatedProduct.getSubCategory());
                    if (updatedProduct.getRating() != null) {
                        product.setRating(updatedProduct.getRating());
                    }
                    if (updatedProduct.getReviews() != null) {
                        product.setReviews(updatedProduct.getReviews());
                    }
                    if (updatedProduct.getMaxOrderQuantity() != null && updatedProduct.getMaxOrderQuantity() > 0) {
                        product.setMaxOrderQuantity(updatedProduct.getMaxOrderQuantity());
                    }
                    return productRepository.save(product);
                })
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
    }

    public List<Product> getProductsBySeller(String sellerEmail) {
        return productRepository.findBySellerEmailIgnoreCase(sellerEmail.trim());
    }

    @Transactional
    public Product updateProductImages(Long id, ProductImageUpdateRequest request, String sellerEmail) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        if (sellerEmail != null && !sellerEmail.isBlank()
                && !sellerEmail.equalsIgnoreCase(product.getSellerEmail())) {
            throw new IllegalArgumentException("This product does not belong to the seller");
        }

        LinkedHashSet<String> uniqueImages = new LinkedHashSet<>();
        if (request.getPrimaryImage() != null && !request.getPrimaryImage().isBlank()) {
            uniqueImages.add(requireExternalImageUrl(request.getPrimaryImage()));
        }
        if (request.getImages() != null) {
            request.getImages().stream()
                    .filter(url -> url != null && !url.isBlank())
                    .map(this::requireExternalImageUrl)
                    .forEach(uniqueImages::add);
        }
        if (uniqueImages.isEmpty()) {
            throw new IllegalArgumentException("At least one image URL is required");
        }

        List<String> images = new ArrayList<>(uniqueImages);
        product.setImage(images.getFirst());
        product.getImages().clear();
        product.getImages().addAll(images);
        return product;
    }

    private String requireExternalImageUrl(String value) {
        String url = value.trim();
        try {
            URI uri = URI.create(url);
            String scheme = uri.getScheme();
            if (uri.getHost() == null || !("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))) {
                throw new IllegalArgumentException("Image URLs must use http or https");
            }
            return url;
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("Invalid image URL: " + url);
        }
    }

    @Transactional
    public void deleteProduct(Long id, String sellerEmail) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        if (sellerEmail != null && !sellerEmail.isBlank()
                && !sellerEmail.equalsIgnoreCase(product.getSellerEmail())) {
            throw new IllegalArgumentException("This product does not belong to the seller");
        }
        productRepository.deleteById(id);
        inventoryRepository.findByProductId(id).ifPresent(inventoryRepository::delete);
    }
}
