package com.facile.productinventoryservice.repository;

import com.facile.productinventoryservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Override
    @EntityGraph(attributePaths = {"category", "subCategory", "subCategory.category", "images"})
    List<Product> findAll();

    @EntityGraph(attributePaths = {"category", "subCategory", "subCategory.category"})
    List<Product> findByCategoryId(Long categoryId);

    @EntityGraph(attributePaths = {"category", "subCategory", "subCategory.category"})
    List<Product> findBySubCategoryId(Long subCategoryId);
}
