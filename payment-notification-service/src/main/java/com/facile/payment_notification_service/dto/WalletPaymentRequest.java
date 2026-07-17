package com.facile.payment_notification_service.dto;
import lombok.Data;
import java.math.BigDecimal;
@Data public class WalletPaymentRequest { private String email; private BigDecimal amount; }
