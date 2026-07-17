package com.facile.productinventoryservice.controller;

import com.facile.productinventoryservice.model.Inventory;
import com.facile.productinventoryservice.service.InventoryService;
import com.facile.productinventoryservice.dto.StockUpdateRequest;
import com.facile.productinventoryservice.dto.StockReduceRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/inventory")
    public List<Inventory> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    @GetMapping("/{id}/inventory")
    public ResponseEntity<Inventory> getInventoryByProductId(@PathVariable Long id) {
        return inventoryService.getInventoryByProductId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/inventory")
    public ResponseEntity<Inventory> updateStock(
            @PathVariable Long id,
            @RequestBody StockUpdateRequest request
    ) {
        try {
            Inventory updated = inventoryService.updateStock(id, request.getStock());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/inventory/reduce")
    public ResponseEntity<String> reduceStock(@RequestBody StockReduceRequest request) {
        try {
            inventoryService.reduceStock(request.getItems());
            return ResponseEntity.ok("Stock successfully reduced");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing stock reduction: " + e.getMessage());
        }
    }
    @PostMapping("/inventory/restore")
    public ResponseEntity<String> restoreStock(@RequestBody StockReduceRequest request) {
        try {
            inventoryService.restoreStock(request.getItems());
            return ResponseEntity.ok("Stock successfully restored");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing stock restoration: " + e.getMessage());
        }
    }
}
