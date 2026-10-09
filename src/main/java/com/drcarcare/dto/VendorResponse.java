package com.drcarcare.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorResponse {

    private Long id;

    private String vendorCode;
    private String vendorName;
    private String contactPerson;

    private String phone;
    private String email;

    private String address;
    private String city;
    private String state;
    private String pincode;

    private String gstin;
    private String category;
    private String paymentTerms;

    private String status;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}