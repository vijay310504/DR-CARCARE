package com.drcarcare.service;

import com.drcarcare.dto.VendorRequest;
import com.drcarcare.dto.VendorResponse;
import com.drcarcare.entity.Vendor;
import com.drcarcare.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final AuditLogService auditLogService;


    // =========================
    // CREATE
    // =========================

    @Transactional
    public VendorResponse createVendor(
            VendorRequest request
    ) {

        if (vendorRepository.existsByVendorCode(
                request.getVendorCode()
        )) {
            throw new RuntimeException(
                    "Vendor code already exists: "
                            + request.getVendorCode()
            );
        }

        LocalDateTime now = LocalDateTime.now();

        Vendor vendor = Vendor.builder()
                .vendorCode(request.getVendorCode())
                .vendorName(request.getVendorName())
                .contactPerson(request.getContactPerson())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .gstin(request.getGstin())
                .category(request.getCategory())
                .paymentTerms(request.getPaymentTerms())
                .status(
                        request.getStatus() == null
                                ? "ACTIVE"
                                : request.getStatus().toUpperCase()
                )
                .notes(request.getNotes())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Vendor savedVendor =
                vendorRepository.save(vendor);

        auditLogService.log(
                "VENDOR_CREATED",
                "VENDOR",
                savedVendor.getId(),
                "Vendor created: " + savedVendor.getVendorName(),
                null,
                "Vendor Code: " + savedVendor.getVendorCode()
                        + ", Vendor Name: " + savedVendor.getVendorName()
        );

        return mapToResponse(savedVendor);
    }


    // =========================
    // GET ALL
    // =========================

    public List<VendorResponse> getAllVendors() {

        return vendorRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================
    // GET BY ID
    // =========================

    public VendorResponse getVendor(Long id) {

        return mapToResponse(
                getVendorEntity(id)
        );
    }


    // =========================
    // ACTIVE
    // =========================

    public List<VendorResponse> getActiveVendors() {

        return vendorRepository
                .findByStatus("ACTIVE")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================
    // SEARCH
    // =========================

    public List<VendorResponse> searchVendors(
            String name
    ) {

        return vendorRepository
                .findByVendorNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================
    // UPDATE
    // =========================

    @Transactional
    public VendorResponse updateVendor(
            Long id,
            VendorRequest request
    ) {

        Vendor vendor = getVendorEntity(id);

        String oldValues =
                "Vendor Code: " + vendor.getVendorCode()
                        + ", Vendor Name: " + vendor.getVendorName()
                        + ", Contact Person: " + vendor.getContactPerson()
                        + ", Phone: " + vendor.getPhone()
                        + ", Email: " + vendor.getEmail()
                        + ", Status: " + vendor.getStatus();

        if (!vendor.getVendorCode()
                .equals(request.getVendorCode())
                && vendorRepository.existsByVendorCode(
                request.getVendorCode()
        )) {

            throw new RuntimeException(
                    "Vendor code already exists: "
                            + request.getVendorCode()
            );
        }

        vendor.setVendorCode(request.getVendorCode());
        vendor.setVendorName(request.getVendorName());
        vendor.setContactPerson(request.getContactPerson());
        vendor.setPhone(request.getPhone());
        vendor.setEmail(request.getEmail());
        vendor.setAddress(request.getAddress());
        vendor.setCity(request.getCity());
        vendor.setState(request.getState());
        vendor.setPincode(request.getPincode());
        vendor.setGstin(request.getGstin());
        vendor.setCategory(request.getCategory());
        vendor.setPaymentTerms(request.getPaymentTerms());

        vendor.setStatus(
                request.getStatus() == null
                        ? vendor.getStatus()
                        : request.getStatus().toUpperCase()
        );

        vendor.setNotes(request.getNotes());
        vendor.setUpdatedAt(LocalDateTime.now());

        Vendor updatedVendor =
                vendorRepository.save(vendor);

        String newValues =
                "Vendor Code: " + updatedVendor.getVendorCode()
                        + ", Vendor Name: " + updatedVendor.getVendorName()
                        + ", Contact Person: " + updatedVendor.getContactPerson()
                        + ", Phone: " + updatedVendor.getPhone()
                        + ", Email: " + updatedVendor.getEmail()
                        + ", Status: " + updatedVendor.getStatus();

        auditLogService.log(
                "VENDOR_UPDATED",
                "VENDOR",
                updatedVendor.getId(),
                "Vendor updated: " + updatedVendor.getVendorName(),
                oldValues,
                newValues
        );

        return mapToResponse(updatedVendor);
    }


    // =========================
    // DEACTIVATE
    // =========================

    @Transactional
    public VendorResponse deactivateVendor(
            Long id
    ) {

        Vendor vendor = getVendorEntity(id);

        String oldStatus = vendor.getStatus();

        vendor.setStatus("INACTIVE");
        vendor.setUpdatedAt(LocalDateTime.now());

        Vendor updatedVendor =
                vendorRepository.save(vendor);

        auditLogService.log(
                "VENDOR_UPDATED",
                "VENDOR",
                updatedVendor.getId(),
                "Vendor deactivated: "
                        + updatedVendor.getVendorName(),
                "Status: " + oldStatus,
                "Status: INACTIVE"
        );

        return mapToResponse(updatedVendor);
    }


    // =========================
    // ENTITY
    // =========================

    public Vendor getVendorEntity(Long id) {

        return vendorRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor not found with id: "
                                        + id
                        )
                );
    }


    // =========================
    // MAPPER
    // =========================

    private VendorResponse mapToResponse(
            Vendor vendor
    ) {

        return VendorResponse.builder()
                .id(vendor.getId())
                .vendorCode(vendor.getVendorCode())
                .vendorName(vendor.getVendorName())
                .contactPerson(vendor.getContactPerson())
                .phone(vendor.getPhone())
                .email(vendor.getEmail())
                .address(vendor.getAddress())
                .city(vendor.getCity())
                .state(vendor.getState())
                .pincode(vendor.getPincode())
                .gstin(vendor.getGstin())
                .category(vendor.getCategory())
                .paymentTerms(vendor.getPaymentTerms())
                .status(vendor.getStatus())
                .notes(vendor.getNotes())
                .createdAt(vendor.getCreatedAt())
                .updatedAt(vendor.getUpdatedAt())
                .build();
    }
}