package com.facile.payment_notification_service.service;

import com.facile.payment_notification_service.entity.GiftCard;
import com.facile.payment_notification_service.entity.Wallet;
import com.facile.payment_notification_service.repository.GiftCardRepository;
import com.facile.payment_notification_service.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;

@Service @RequiredArgsConstructor
public class GiftCardService {
    private final GiftCardRepository giftCardRepository;
    private final WalletRepository walletRepository;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public GiftCard issue(String email, BigDecimal amount, String paymentId) {
        return giftCardRepository.findByRazorpayPaymentId(paymentId).orElseGet(() -> {
            String code;
            do { code = randomDigits(16); } while (giftCardRepository.existsByCode(code));
            String pin = randomDigits(3);
            GiftCard card = giftCardRepository.save(GiftCard.builder().code(code).pinHash(hash(pin))
                    .amount(amount).purchaserEmail(email.toLowerCase()).razorpayPaymentId(paymentId)
                    .createdAt(LocalDateTime.now()).build());
            emailService.sendGiftCardEmail(email, code, pin, amount);
            return card;
        });
    }

    @Transactional
    public Map<String, Object> redeem(String email, String rawCode, String pin) {
        String code = rawCode == null ? "" : rawCode.replaceAll("\\D", "");
        GiftCard card = giftCardRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Gift card or PIN is incorrect."));
        if (card.getRedeemedAt() != null) throw new IllegalArgumentException("This gift card has already been redeemed.");
        if (!MessageDigest.isEqual(card.getPinHash().getBytes(StandardCharsets.UTF_8), hash(pin).getBytes(StandardCharsets.UTF_8)))
            throw new IllegalArgumentException("Gift card or PIN is incorrect.");
        Wallet wallet = walletRepository.findByEmailIgnoreCase(email).orElseGet(() -> Wallet.builder().email(email.toLowerCase()).build());
        wallet.setBalance(wallet.getBalance().add(card.getAmount()));
        walletRepository.save(wallet);
        card.setRedeemedBy(email.toLowerCase()); card.setRedeemedAt(LocalDateTime.now());
        giftCardRepository.save(card);
        return Map.of("credited", card.getAmount(), "balance", wallet.getBalance());
    }

    @Transactional
    public BigDecimal balance(String email) {
        return walletRepository.findByEmailIgnoreCase(email).map(Wallet::getBalance).orElse(BigDecimal.ZERO);
    }

    @Transactional
    public BigDecimal pay(String email, BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) throw new IllegalArgumentException("Invalid payment amount.");
        Wallet wallet = walletRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new IllegalArgumentException("Wallet not found."));
        if (wallet.getBalance().compareTo(amount) < 0) throw new IllegalArgumentException("Insufficient gift-card balance.");
        wallet.setBalance(wallet.getBalance().subtract(amount));
        return walletRepository.save(wallet).getBalance();
    }

    @Transactional
    public void ensureBalance(String email, BigDecimal minimumBalance) {
        Wallet wallet = walletRepository.findByEmailIgnoreCase(email).orElseGet(() -> Wallet.builder().email(email.toLowerCase()).build());
        if (wallet.getBalance().compareTo(minimumBalance) < 0) wallet.setBalance(minimumBalance);
        walletRepository.save(wallet);
    }

    @Transactional
    public void setBalance(String email, BigDecimal balance) {
        Wallet wallet = walletRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> Wallet.builder().email(email.toLowerCase()).build());
        wallet.setBalance(balance);
        walletRepository.save(wallet);
    }

    private String randomDigits(int length) {
        StringBuilder value = new StringBuilder(length);
        for (int i = 0; i < length; i++) value.append(random.nextInt(10));
        return value.toString();
    }
    private String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception e) { throw new IllegalStateException(e); }
    }
}
