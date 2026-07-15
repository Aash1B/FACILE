package com.facile.productinventoryservice.service;

import com.facile.productinventoryservice.model.Category;
import com.facile.productinventoryservice.model.SubCategory;
import com.facile.productinventoryservice.repository.CategoryRepository;
import com.facile.productinventoryservice.repository.SubCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public Optional<Category> getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }

    @Transactional
    public Category createCategory(Category category) {
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            throw new IllegalArgumentException("Category already exists with name: " + category.getName());
        }
        return categoryRepository.save(category);
    }

    public List<SubCategory> getSubCategoriesByCategoryId(Long categoryId) {
        return subCategoryRepository.findByCategoryId(categoryId);
    }

    @Transactional
    public SubCategory createSubCategory(Long categoryId, SubCategory subCategory) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + categoryId));
        
        if (subCategoryRepository.findByNameAndCategoryId(subCategory.getName(), categoryId).isPresent()) {
            throw new IllegalArgumentException("SubCategory " + subCategory.getName() + " already exists under category " + category.getName());
        }

        subCategory.setCategory(category);
        return subCategoryRepository.save(subCategory);
    }
}
