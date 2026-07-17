package com.facile.payment_notification_service.repository;
import com.facile.payment_notification_service.entity.GiftCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface GiftCardRepository extends JpaRepository<GiftCard, Long> {
    Optional<GiftCard> findByCode(String code);
    boolean existsByCode(String code);
    Optional<GiftCard> findByRazorpayPaymentId(String paymentId);
}
