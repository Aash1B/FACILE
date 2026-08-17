package com.facile.order_cart_service;

import com.facile.order_cart_service.cart.Cart;
import com.facile.order_cart_service.cart.CartItem;
import com.facile.order_cart_service.cart.CartService;
import com.facile.order_cart_service.cart.CartController;
import com.facile.order_cart_service.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CartController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = "FRONTEND_URL=https://facile-shop.vercel.app")
class CartCorsSecurityTest {

    private static final String STOREFRONT_ORIGIN = "https://facile-shop.vercel.app";
    private static final String CART_ADD_PATH = "/api/cart/customer@example.com/add";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CartService cartService;

    @Test
    void allowsStorefrontPreflightWithoutInvokingCartController() throws Exception {
        mockMvc.perform(options(CART_ADD_PATH)
                        .header(HttpHeaders.ORIGIN, STOREFRONT_ORIGIN)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.POST.name())
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "content-type,idempotency-key"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, STOREFRONT_ORIGIN))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, org.hamcrest.Matchers.containsString("POST")))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
                        org.hamcrest.Matchers.allOf(
                                org.hamcrest.Matchers.containsStringIgnoringCase("content-type"),
                                org.hamcrest.Matchers.containsStringIgnoringCase("idempotency-key"))));

        verifyNoInteractions(cartService);
    }

    @Test
    void rejectsPreflightFromUnapprovedOrigin() throws Exception {
        mockMvc.perform(options(CART_ADD_PATH)
                        .header(HttpHeaders.ORIGIN, "https://malicious.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.POST.name())
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "content-type"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));

        verifyNoInteractions(cartService);
    }

    @Test
    void storefrontPostStillReachesExistingCartRoute() throws Exception {
        when(cartService.addItemToCart(anyString(), any(CartItem.class), nullable(String.class)))
                .thenReturn(new Cart());

        mockMvc.perform(post(CART_ADD_PATH)
                        .header(HttpHeaders.ORIGIN, STOREFRONT_ORIGIN)
                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                        .header("Idempotency-Key", "cart-test-key")
                        .content("""
                                {
                                  "productId": "bs1",
                                  "productName": "Smart Watch Series 5",
                                  "image": "https://example.test/watch.png",
                                  "maxOrderQuantity": 10,
                                  "price": 89.99,
                                  "quantity": 1,
                                  "selectedSize": null
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, STOREFRONT_ORIGIN));

        verify(cartService).addItemToCart(anyString(), any(CartItem.class), nullable(String.class));
    }
}
