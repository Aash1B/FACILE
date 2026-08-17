package com.facile.payment_notification_service;

import com.facile.payment_notification_service.config.SecurityConfig;
import com.facile.payment_notification_service.controller.PaymentController;
import com.facile.payment_notification_service.service.GiftCardService;
import com.facile.payment_notification_service.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsStringIgnoringCase;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PaymentController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = "FRONTEND_URL=https://facile-shop.vercel.app")
class PaymentCorsSecurityTest {

    private static final String STOREFRONT_ORIGIN = "https://facile-shop.vercel.app";
    private static final String CREATE_ORDER_PATH = "/payments/create-order";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentService paymentService;

    @MockBean
    private GiftCardService giftCardService;

    @Test
    void allowsStorefrontPreflightWithoutInvokingPaymentController() throws Exception {
        mockMvc.perform(options(CREATE_ORDER_PATH)
                        .param("amount", "193.98")
                        .header(HttpHeaders.ORIGIN, STOREFRONT_ORIGIN)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.POST.name())
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, STOREFRONT_ORIGIN))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, containsStringIgnoringCase("POST")))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
                        containsStringIgnoringCase("Content-Type")));

        verifyNoInteractions(paymentService, giftCardService);
    }

    @Test
    void rejectsPreflightFromUnapprovedOrigin() throws Exception {
        mockMvc.perform(options(CREATE_ORDER_PATH)
                        .header(HttpHeaders.ORIGIN, "https://malicious.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.POST.name())
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "content-type"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));

        verifyNoInteractions(paymentService, giftCardService);
    }

    @Test
    void existingCreateOrderPostRouteRemainsUnchanged() throws Exception {
        when(paymentService.createOrder(193.98))
                .thenThrow(new IllegalStateException("mocked payment provider"));

        mockMvc.perform(post(CREATE_ORDER_PATH)
                        .param("amount", "193.98")
                        .header(HttpHeaders.ORIGIN, STOREFRONT_ORIGIN)
                        .contentType("application/json"))
                .andExpect(status().isBadRequest())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, STOREFRONT_ORIGIN));

        verify(paymentService).createOrder(193.98);
    }
}
