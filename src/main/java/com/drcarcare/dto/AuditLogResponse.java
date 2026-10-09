package com.drcarcare.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponse {

    private Long id;

    private Long userId;

    private String username;

    private String action;

    private String entityType;

    private Long entityId;

    private String description;

    private String oldValues;

    private String newValues;

    private String ipAddress;

    private LocalDateTime createdAt;
}