package com.drcarcare.controller;

import com.drcarcare.dto.AuditLogResponse;
import com.drcarcare.dto.AuditLogSearchRequest;
import com.drcarcare.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    // =========================================================
    // GET ALL - PAGINATED
    // =========================================================

    @GetMapping
    public ResponseEntity<Page<AuditLogResponse>> getAllLogs(
            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size
    ) {

        return ResponseEntity.ok(
                auditLogService.getAllLogs(
                        page,
                        size
                )
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<AuditLogResponse> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                auditLogService.getLogById(id)
        );
    }

    // =========================================================
    // GET BY USER ID
    // =========================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLogResponse>> getByUser(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                auditLogService.getByUserId(userId)
        );
    }

    // =========================================================
    // GET BY USERNAME
    // =========================================================

    @GetMapping("/username/{username}")
    public ResponseEntity<List<AuditLogResponse>> getByUsername(
            @PathVariable String username
    ) {

        return ResponseEntity.ok(
                auditLogService.getByUsername(username)
        );
    }

    // =========================================================
    // GET BY ACTION
    // =========================================================

    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditLogResponse>> getByAction(
            @PathVariable String action
    ) {

        return ResponseEntity.ok(
                auditLogService.getByAction(action)
        );
    }

    // =========================================================
    // GET BY ENTITY
    // =========================================================

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditLogResponse>> getByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId
    ) {

        return ResponseEntity.ok(
                auditLogService.getByEntity(
                        entityType,
                        entityId
                )
        );
    }

    // =========================================================
    // GET BY DATE RANGE
    // =========================================================

    @GetMapping("/date-range")
    public ResponseEntity<List<AuditLogResponse>> getByDateRange(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {

        return ResponseEntity.ok(
                auditLogService.getByDateRange(
                        from,
                        to
                )
        );
    }

    // =========================================================
    // SEARCH
    // =========================================================

    @GetMapping("/search")
    public ResponseEntity<List<AuditLogResponse>> search(
            @RequestParam(required = false)
            LocalDate from,

            @RequestParam(required = false)
            LocalDate to,

            @RequestParam(required = false)
            String username,

            @RequestParam(required = false)
            String action,

            @RequestParam(required = false)
            String entityType,

            @RequestParam(required = false)
            Long entityId
    ) {

        AuditLogSearchRequest request =
                AuditLogSearchRequest.builder()
                        .from(from)
                        .to(to)
                        .username(username)
                        .action(action)
                        .entityType(entityType)
                        .entityId(entityId)
                        .build();

        return ResponseEntity.ok(
                auditLogService.search(request)
        );
    }

    // =========================================================
    // CREATE TEST / INTERNAL AUDIT LOG
    // =========================================================

    @PostMapping("/test")
    public ResponseEntity<AuditLogResponse> createTestLog(
            @RequestParam String action,
            @RequestParam String entityType,
            @RequestParam(required = false)
            Long entityId,

            @RequestParam String description,

            @RequestParam(required = false)
            String oldValues,

            @RequestParam(required = false)
            String newValues,

            HttpServletRequest request
    ) {

        return ResponseEntity.ok(
                auditLogService.createAuditLog(
                        action.toUpperCase(),
                        entityType.toUpperCase(),
                        entityId,
                        description,
                        oldValues,
                        newValues,
                        request
                )
        );
    }
}