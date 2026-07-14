package com.facile.payment_notification_service.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final RazorpayClient razorpayClient;

    public PaymentService(RazorpayClient razorpayClient) {
        this.razorpayClient = razorpayClient;
    }

    public Order createOrder(int amount) throws Exception {

        JSONObject orderRequest = new JSONObject();

        orderRequest.put("amount", amount * 100); // Convert ₹ to paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());

        return razorpayClient.orders.create(orderRequest);
    }
}