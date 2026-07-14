package com.facile.payment_notification_service.config;

import com.razorpay.RazorpayClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class RazorpayConfig {

    @Bean
    public RazorpayClient razorpayClient(Environment env) {

        String keyId = env.getProperty("razorpay.key.id");
        String keySecret = env.getProperty("razorpay.key.secret");

        System.out.println("KEY ID = " + keyId);
        System.out.println("KEY SECRET = " + keySecret);

        if (keyId == null || keySecret == null) {
            throw new RuntimeException("Razorpay properties not found!");
        }

        try {
            return new RazorpayClient(keyId, keySecret);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}