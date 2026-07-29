package com.facile.payment_notification_service.config;
import com.facile.payment_notification_service.service.GiftCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
@Component @RequiredArgsConstructor
public class WalletSeedInitializer {
    private final GiftCardService giftCardService;

    @EventListener(ApplicationReadyEvent.class)
    public void initializeWallets() {
        giftCardService.setBalance("kritagyaarora478@gmail.com", BigDecimal.ZERO);
        giftCardService.ensureBalance("kritagyaarora4782@gmail.com", new BigDecimal("100000.00"));
    }
}
