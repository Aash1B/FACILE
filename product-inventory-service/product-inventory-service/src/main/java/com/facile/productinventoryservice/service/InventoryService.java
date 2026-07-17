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

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Optional<Inventory> getInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId);
    }

    @Transactional
    public Inventory updateStock(Long productId, Integer newStock) {
        if (newStock == null || newStock < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> Inventory.builder().productId(productId).build());
        inventory.setStock(newStock);
        return inventoryRepository.save(inventory);
    }

    @Transactional
    public void reduceStock(List<StockReduceItem> items) {
        for (StockReduceItem item : items) {
            if (item.getProductId() == null || item.getQuantity() == null || item.getQuantity() < 1) {
                throw new IllegalArgumentException("Product id and a positive quantity are required");
            }
            var product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + item.getProductId()));
            int maxOrderQuantity = product.getMaxOrderQuantity() != null ? product.getMaxOrderQuantity() : 10;
            if (item.getQuantity() > maxOrderQuantity) {
                throw new IllegalStateException("Maximum order quantity for " + product.getTitle()
                        + " is " + maxOrderQuantity);
            }
            Inventory inventory = inventoryRepository.findByProductIdForUpdate(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Inventory not found for product: " + item.getProductId()));
            
            if (inventory.getStock() < item.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product id " + item.getProductId() + 
                        ". Available: " + inventory.getStock() + ", Required: " + item.getQuantity());
            }
            
            inventory.setStock(inventory.getStock() - item.getQuantity());
            inventory.setSold((inventory.getSold() == null ? 0 : inventory.getSold()) + item.getQuantity());
            inventoryRepository.save(inventory);
        }
    }

    @Transactional
    public void restoreStock(List<StockReduceItem> items) {
        for (StockReduceItem item : items) {
            Optional<Inventory> inventoryOpt = inventoryRepository.findByProductId(item.getProductId());
            if (inventoryOpt.isPresent()) {
                Inventory inventory = inventoryOpt.get();
                inventory.setStock(inventory.getStock() + item.getQuantity());
                inventoryRepository.save(inventory);
            }
        }
    }
}
