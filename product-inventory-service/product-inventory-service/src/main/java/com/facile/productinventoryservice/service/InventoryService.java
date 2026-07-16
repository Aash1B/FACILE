package com.facile.productinventoryservice.service;

import com.facile.productinventoryservice.model.Inventory;
import com.facile.productinventoryservice.repository.InventoryRepository;
import com.facile.productinventoryservice.repository.ProductRepository;
import com.facile.productinventoryservice.dto.StockReduceItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    public Optional<Inventory> getInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId);
    }

    @Transactional
    public Inventory updateStock(Long productId, Integer newStock) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> Inventory.builder().productId(productId).build());
        inventory.setStock(newStock);
        return inventoryRepository.save(inventory);
    }

    @Transactional
    public void reduceStock(List<StockReduceItem> items) {
        for (StockReduceItem item : items) {
            var product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + item.getProductId()));
            int maxOrderQuantity = product.getMaxOrderQuantity() != null ? product.getMaxOrderQuantity() : 10;
            if (item.getQuantity() > maxOrderQuantity) {
                throw new IllegalStateException("Maximum order quantity for " + product.getTitle()
                        + " is " + maxOrderQuantity);
            }
            Inventory inventory = inventoryRepository.findByProductId(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Inventory not found for product: " + item.getProductId()));
            
            if (inventory.getStock() < item.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product id " + item.getProductId() + 
                        ". Available: " + inventory.getStock() + ", Required: " + item.getQuantity());
            }
            
            inventory.setStock(inventory.getStock() - item.getQuantity());
            inventoryRepository.save(inventory);
        }
    }
}
