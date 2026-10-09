package com.drcarcare.service;

import com.drcarcare.dto.AuditLogResponse;
import com.drcarcare.dto.AuditLogSearchRequest;
import com.drcarcare.entity.AuditLog;
import com.drcarcare.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    // =========================================================
    // CREATE AUDIT LOG
    // =========================================================

    @Transactional
    public AuditLogResponse createAuditLog(
            String action,
            String entityType,
            Long entityId,
            String description,
            String oldValues,
            String newValues,
            HttpServletRequest request
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String username = null;

        if (authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(
                authentication.getName()
        )) {

            username = authentication.getName();
        }

        String ipAddress = getClientIpAddress(request);

        AuditLog auditLog = AuditLog.builder()
                .username(username)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .oldValues(oldValues)
                .newValues(newValues)
                .ipAddress(ipAddress)
                .createdAt(LocalDateTime.now())
                .build();

        return mapToResponse(
                auditLogRepository.save(auditLog)
        );
    }

    // =========================================================
    // INTERNAL LOG METHOD
    // =========================================================

    @Transactional
    public AuditLogResponse log(
            String action,
            String entityType,
            Long entityId,
            String description,
            String oldValues,
            String newValues
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String username = null;

        if (authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(
                authentication.getName()
        )) {

            username = authentication.getName();
        }

        AuditLog auditLog = AuditLog.builder()
                .username(username)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .oldValues(oldValues)
                .newValues(newValues)
                .ipAddress(null)
                .createdAt(LocalDateTime.now())
                .build();

        return mapToResponse(
                auditLogRepository.save(auditLog)
        );
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAllLogs(
            int page,
            int size
    ) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page cannot be negative"
            );
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100"
            );
        }

        PageRequest pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        return auditLogRepository
                .findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponse);
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public AuditLogResponse getLogById(Long id) {

        AuditLog auditLog =
                auditLogRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Audit log not found with id: "
                                                + id
                                )
                        );

        return mapToResponse(auditLog);
    }

    // =========================================================
    // GET BY USER
    // =========================================================

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getByUserId(
            Long userId
    ) {

        return auditLogRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET BY USERNAME
    // =========================================================

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getByUsername(
            String username
    ) {

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException(
                    "Username is required"
            );
        }

        return auditLogRepository
                .findByUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET BY ACTION
    // =========================================================

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getByAction(
            String action
    ) {

        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException(
                    "Action is required"
            );
        }

        return auditLogRepository
                .findByActionOrderByCreatedAtDesc(
                        action.toUpperCase()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET BY ENTITY
    // =========================================================

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getByEntity(
            String entityType,
            Long entityId
    ) {

        if (entityType == null
                || entityType.isBlank()) {

            throw new IllegalArgumentException(
                    "Entity type is required"
            );
        }

        if (entityId == null) {
            throw new IllegalArgumentException(
                    "Entity id is required"
            );
        }

        return auditLogRepository
                .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                        entityType.toUpperCase(),
                        entityId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // DATE RANGE
    // =========================================================

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getByDateRange(
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        LocalDateTime fromDateTime =
                from.atStartOfDay();

        LocalDateTime toDateTime =
                to.plusDays(1).atStartOfDay();

        return auditLogRepository
                .findByCreatedAtBetweenOrderByCreatedAtDesc(
                        fromDateTime,
                        toDateTime
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // SEARCH
    // =========================================================

    @Transactional(readOnly = true)
    public List<AuditLogResponse> search(
            AuditLogSearchRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Search request is required"
            );
        }

        if (request.getFrom() != null
                && request.getTo() != null) {

            validateDateRange(
                    request.getFrom(),
                    request.getTo()
            );
        }

        /*
         * Entity-specific search
         */
        if (request.getEntityType() != null
                && !request.getEntityType().isBlank()
                && request.getEntityId() != null) {

            return getByEntity(
                    request.getEntityType(),
                    request.getEntityId()
            );
        }

        /*
         * Action search
         */
        if (request.getAction() != null
                && !request.getAction().isBlank()
                && request.getFrom() == null
                && request.getTo() == null) {

            return getByAction(request.getAction());
        }

        /*
         * Username search
         */
        if (request.getUsername() != null
                && !request.getUsername().isBlank()
                && request.getFrom() == null
                && request.getTo() == null) {

            return getByUsername(request.getUsername());
        }

        /*
         * Date search
         */
        if (request.getFrom() != null
                && request.getTo() != null
                && request.getUsername() == null) {

            return getByDateRange(
                    request.getFrom(),
                    request.getTo()
            );
        }

        /*
         * No filters
         */
        return auditLogRepository
                .findAll(
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // IP ADDRESS
    // =========================================================

    private String getClientIpAddress(
            HttpServletRequest request
    ) {

        if (request == null) {
            return null;
        }

        String xForwardedFor =
                request.getHeader("X-Forwarded-For");

        if (xForwardedFor != null
                && !xForwardedFor.isBlank()) {

            return xForwardedFor
                    .split(",")[0]
                    .trim();
        }

        String proxyClientIp =
                request.getHeader("Proxy-Client-IP");

        if (proxyClientIp != null
                && !proxyClientIp.isBlank()
                && !"unknown".equalsIgnoreCase(
                proxyClientIp
        )) {

            return proxyClientIp;
        }

        String wlProxyClientIp =
                request.getHeader("WL-Proxy-Client-IP");

        if (wlProxyClientIp != null
                && !wlProxyClientIp.isBlank()
                && !"unknown".equalsIgnoreCase(
                wlProxyClientIp
        )) {

            return wlProxyClientIp;
        }

        return request.getRemoteAddr();
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateDateRange(
            LocalDate from,
            LocalDate to
    ) {

        if (from == null) {
            throw new IllegalArgumentException(
                    "From date is required"
            );
        }

        if (to == null) {
            throw new IllegalArgumentException(
                    "To date is required"
            );
        }

        if (from.isAfter(to)) {
            throw new IllegalArgumentException(
                    "From date cannot be after To date"
            );
        }
    }

    // =========================================================
    // MAPPER
    // =========================================================

    private AuditLogResponse mapToResponse(
            AuditLog auditLog
    ) {

        return AuditLogResponse.builder()
                .id(auditLog.getId())
                .userId(auditLog.getUserId())
                .username(auditLog.getUsername())
                .action(auditLog.getAction())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .description(auditLog.getDescription())
                .oldValues(auditLog.getOldValues())
                .newValues(auditLog.getNewValues())
                .ipAddress(auditLog.getIpAddress())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}