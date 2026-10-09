package com.drcarcare.repository;

import com.drcarcare.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAllByOrderByCreatedAtDesc(
            Pageable pageable
    );

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    List<AuditLog> findByUsernameOrderByCreatedAtDesc(
            String username
    );

    List<AuditLog> findByActionOrderByCreatedAtDesc(
            String action
    );

    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
            String entityType,
            Long entityId
    );

    List<AuditLog> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime from,
            LocalDateTime to
    );

    List<AuditLog> findByUsernameAndCreatedAtBetweenOrderByCreatedAtDesc(
            String username,
            LocalDateTime from,
            LocalDateTime to
    );
}