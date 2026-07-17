package com.facile.payment_notification_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name = "wallets")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Wallet {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true, nullable = false) private String email;
    @Column(nullable = false, precision = 14, scale = 2) @Builder.Default private BigDecimal balance = BigDecimal.ZERO;
    @Version private Long version;
}
