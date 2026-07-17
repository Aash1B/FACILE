package com.facile.payment_notification_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "gift_cards")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class GiftCard {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true, nullable = false, length = 16) private String code;
    @Column(nullable = false, length = 64) private String pinHash;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    @Column(nullable = false) private String purchaserEmail;
    @Column(unique = true, nullable = false) private String razorpayPaymentId;
    @Column(nullable = false) private LocalDateTime createdAt;
    private String redeemedBy;
    private LocalDateTime redeemedAt;
}
