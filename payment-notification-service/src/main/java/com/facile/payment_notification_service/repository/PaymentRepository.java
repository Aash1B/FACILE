package com.facile.payment_notification_service.repository;

import com.facile.payment_notification_service.entity.Payment;
import com.facile.payment_notification_service.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Payment> findByOrderId(String orderId);

    Optional<Payment> findTopByOrderIdOrderByCreatedAtDesc(String orderId);

    List<Payment> findByStatus(PaymentStatus status);
}
