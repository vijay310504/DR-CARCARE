package com.drcarcare.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogSearchRequest {

    private LocalDate from;

    private LocalDate to;

    private String username;

    private String action;

    private String entityType;

    private Long entityId;
}