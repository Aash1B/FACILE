package com.facile.payment_notification_service.config;
import com.facile.payment_notification_service.service.GiftCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
@Component @RequiredArgsConstructor
public class WalletSeedInitializer implements CommandLineRunner {
    private final GiftCardService giftCardService;
    public void run(String... args) {
        giftCardService.setBalance("kritagyaarora478@gmail.com", BigDecimal.ZERO);
        giftCardService.ensureBalance("kritagyaarora4782@gmail.com", new BigDecimal("100000.00"));
    }
}
