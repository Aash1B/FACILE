package com.facile.productinventoryservice.controller;

import com.facile.productinventoryservice.model.Category;
import com.facile.productinventoryservice.model.SubCategory;
import com.facile.productinventoryservice.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(category));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{id}/subcategories")
    public ResponseEntity<List<SubCategory>> getSubCategoriesByCategoryId(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getSubCategoriesByCategoryId(id));
    }

    @PostMapping("/{id}/subcategories")
    public ResponseEntity<SubCategory> createSubCategory(
            @PathVariable Long id,
            @RequestBody SubCategory subCategory
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createSubCategory(id, subCategory));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
