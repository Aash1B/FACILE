package com.facile.payment_notification_service;

import com.facile.payment_notification_service.repository.PaymentRepository;
import com.facile.payment_notification_service.service.EmailService;
import com.facile.payment_notification_service.service.GiftCardService;
import com.facile.payment_notification_service.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.OrderClient;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentServiceCreateOrderTest {

    private OrderClient orderClient;
    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        RazorpayClient razorpayClient = mock(RazorpayClient.class);
        orderClient = mock(OrderClient.class);
        razorpayClient.orders = orderClient;

        paymentService = new PaymentService(
                razorpayClient,
                mock(PaymentRepository.class),
                mock(EmailService.class),
                mock(GiftCardService.class)
        );
    }

    @Test
    void convertsRupeesToIntegerPaiseWithoutCallingRazorpay() throws Exception {
        Order createdOrder = new Order(new JSONObject().put("id", "order_test"));
        when(orderClient.create(any(JSONObject.class))).thenReturn(createdOrder);

        paymentService.createOrder(new BigDecimal("193.98"));

        ArgumentCaptor<JSONObject> requestCaptor = ArgumentCaptor.forClass(JSONObject.class);
        verify(orderClient).create(requestCaptor.capture());
        JSONObject request = requestCaptor.getValue();

        assertEquals(19398L, request.getLong("amount"));
        assertEquals("INR", request.getString("currency"));
    }

    @Test
    void normalizesBrowserFloatingPointArtifactToCurrencyPrecision() throws Exception {
        Order createdOrder = new Order(new JSONObject().put("id", "order_test"));
        when(orderClient.create(any(JSONObject.class))).thenReturn(createdOrder);

        paymentService.createOrder(new BigDecimal("193.98000000000002"));

        ArgumentCaptor<JSONObject> requestCaptor = ArgumentCaptor.forClass(JSONObject.class);
        verify(orderClient).create(requestCaptor.capture());
        assertEquals(19398L, requestCaptor.getValue().getLong("amount"));
    }

    @Test
    void rejectsZeroAndNegativeAmountsBeforeCallingRazorpay() throws Exception {
        assertThrows(IllegalArgumentException.class,
                () -> paymentService.createOrder(new BigDecimal("0")));
        assertThrows(IllegalArgumentException.class,
                () -> paymentService.createOrder(new BigDecimal("-1")));

        verify(orderClient, org.mockito.Mockito.never()).create(any(JSONObject.class));
    }
}
