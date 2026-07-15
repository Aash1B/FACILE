package com.facile.auth_user_service.repository;

import com.facile.auth_user_service.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEmailOrderByTimestampDesc(String email);
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);
}
