package com.facile.order_cart_service.cart;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;

    public Cart getCartByUserId(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));
    }

    public synchronized Cart addItemToCart(String userId, CartItem newItem, String idempotencyKey) {
        Cart cart = getCartByUserId(userId);

        if (cart.getProcessedRequestKeys() == null) {
            cart.setProcessedRequestKeys(new java.util.ArrayList<>());
        }

        if (idempotencyKey != null && !idempotencyKey.isBlank()
                && cart.getProcessedRequestKeys().contains(idempotencyKey)) {
            return cart;
        }

        boolean itemExists = false; 
        int maxQuantity = newItem.getMaxOrderQuantity() != null && newItem.getMaxOrderQuantity() > 0
                ? newItem.getMaxOrderQuantity() : 10;
        for (CartItem item : cart.getItems()) {
            if (item.getProductId().equals(newItem.getProductId()) &&
                java.util.Objects.equals(item.getSelectedSize(), newItem.getSelectedSize())) {
                item.setMaxOrderQuantity(maxQuantity);
                item.setQuantity(Math.min(maxQuantity, item.getQuantity() + newItem.getQuantity()));
                if (newItem.getImage() != null && !newItem.getImage().isBlank()) {
                    item.setImage(newItem.getImage());
                }
                itemExists = true;
                break;
            }
        }

        if (!itemExists) {
            newItem.setMaxOrderQuantity(maxQuantity);
            newItem.setQuantity(Math.min(maxQuantity, Math.max(1, newItem.getQuantity())));
            cart.getItems().add(newItem);
        }

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            cart.getProcessedRequestKeys().add(idempotencyKey);
            if (cart.getProcessedRequestKeys().size() > 100) {
                cart.getProcessedRequestKeys().remove(0);
            }
        }

        recalculateTotal(cart);
        return cartRepository.save(cart);
    }

    public Cart removeItemFromCart(String userId, String productId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        recalculateTotal(cart);
        return cartRepository.save(cart);
    }

    public Cart clearCart(String userId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().clear();
        recalculateTotal(cart);
        return cartRepository.save(cart);
    }

    private Cart createNewCart(String userId) {
        Cart newCart = new Cart();
        newCart.setUserId(userId);
        return cartRepository.save(newCart);
    }

    private void recalculateTotal(Cart cart) {
        double total = 0;
        for (CartItem item : cart.getItems()) {
            total += item.getPrice() * item.getQuantity();
        }
        cart.setTotalAmount(total);
    }
}
