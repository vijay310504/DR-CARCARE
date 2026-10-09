package com.drcarcare.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {

    private Long id;

    private String customerCode;

    private String name;

    private String email;

    private String phone;

    private String alternatePhone;

    private String address;

    private String city;

    private String state;

    private String pincode;

    private String notes;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}