package com.facile.auth_user_service.repository;

import com.facile.auth_user_service.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEmailOrderByTimestampDesc(String email);
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);
    void deleteByUserId(Long userId);
}
