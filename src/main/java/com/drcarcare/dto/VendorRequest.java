package com.drcarcare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorRequest {

    @NotBlank(message = "Vendor code is required")
    @Size(max = 30)
    private String vendorCode;

    @NotBlank(message = "Vendor name is required")
    @Size(max = 150)
    private String vendorName;

    @Size(max = 100)
    private String contactPerson;

    @Size(max = 20)
    private String phone;

    @Email(message = "Invalid email address")
    @Size(max = 150)
    private String email;

    @Size(max = 500)
    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    @Size(max = 10)
    private String pincode;

    @Size(max = 30)
    private String gstin;

    @Size(max = 100)
    private String category;

    @Size(max = 100)
    private String paymentTerms;

    private String status;

    @Size(max = 1000)
    private String notes;
}