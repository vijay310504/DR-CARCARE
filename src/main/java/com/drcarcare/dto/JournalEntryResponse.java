package com.drcarcare.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntryResponse {

    private Long id;
    private String entryNumber;
    private LocalDate entryDate;
    private String entryType;
    private String referenceType;
    private Long referenceId;
    private String description;
    private List<JournalEntryLineResponse> lines;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}