package com.facile.productinventoryservice;

import com.facile.productinventoryservice.config.SecurityConfig;
import com.facile.productinventoryservice.controller.ProductController;
import com.facile.productinventoryservice.model.Product;
import com.facile.productinventoryservice.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProductController.class)
@Import(SecurityConfig.class)
class ProductCatalogSecurityTest {

    private static final String STOREFRONT_ORIGIN = "https://facile-shop.vercel.app";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Test
    void storefrontCanReadProductCatalogWithoutAuthentication() throws Exception {
        given(productService.getAllProducts()).willReturn(List.of(Product.builder()
                .id(1L)
                .title("Catalog product")
                .mrp(BigDecimal.TEN)
                .sellingPrice(BigDecimal.ONE)
                .build()));

        mockMvc.perform(get("/api/products")
                        .header(HttpHeaders.ORIGIN, STOREFRONT_ORIGIN))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, STOREFRONT_ORIGIN));
    }

    @Test
    void storefrontCanReadProductByIdWithoutAuthentication() throws Exception {
        given(productService.getProductById(1L)).willReturn(Optional.of(Product.builder()
                .id(1L)
                .title("Catalog product")
                .mrp(BigDecimal.TEN)
                .sellingPrice(BigDecimal.ONE)
                .build()));

        mockMvc.perform(get("/api/products/1")
                        .header(HttpHeaders.ORIGIN, STOREFRONT_ORIGIN))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, STOREFRONT_ORIGIN));
    }
}
