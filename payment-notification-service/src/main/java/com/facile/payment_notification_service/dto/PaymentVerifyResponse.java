package com.facile.payment_notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyResponse {

    private boolean success;
    private String message;
    private Long paymentRecordId;
}
