package com.drcarcare.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountRequest {

    @NotBlank
    private String accountCode;

    @NotBlank
    private String accountName;

    @NotBlank
    private String accountType;

    private Long parentAccountId;

    private Boolean active;

    private String description;
}