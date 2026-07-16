package com.facile.productinventoryservice.service;

import com.facile.productinventoryservice.model.Product;
import com.facile.productinventoryservice.model.Inventory;
import com.facile.productinventoryservice.repository.ProductRepository;
import com.facile.productinventoryservice.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new IllegalArgumentException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
        inventoryRepository.findByProductId(id).ifPresent(inventoryRepository::delete);
    }
}
