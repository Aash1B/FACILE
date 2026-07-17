package com.facile.productinventoryservice.controller;

import com.facile.productinventoryservice.dto.ProductImageUpdateRequest;
import com.facile.productinventoryservice.model.Product;
import com.facile.productinventoryservice.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long subCategoryId,
            @RequestParam(required = false) String sellerEmail
    ) {
        if (sellerEmail != null && !sellerEmail.isBlank()) {
            return ResponseEntity.ok(productService.getProductsBySeller(sellerEmail));
        }
        if (subCategoryId != null) {
            return ResponseEntity.ok(productService.getProductsBySubCategory(subCategoryId));
        }
        if (categoryId != null) {
            return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product,
            @RequestParam(required = false, defaultValue = "0") Integer initialStock
    ) {
        try {
            Product savedProduct = productService.createProduct(product, initialStock);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product
    ) {
        try {
            return ResponseEntity.ok(productService.updateProduct(id, product));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/images")
    public ResponseEntity<Product> updateProductImages(
            @PathVariable Long id,
            @RequestBody ProductImageUpdateRequest request,
            @RequestParam(required = false) String sellerEmail
    ) {
        try {
            return ResponseEntity.ok(productService.updateProductImages(id, request, sellerEmail));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, @RequestParam(required = false) String sellerEmail) {
        try {
            productService.deleteProduct(id, sellerEmail);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
