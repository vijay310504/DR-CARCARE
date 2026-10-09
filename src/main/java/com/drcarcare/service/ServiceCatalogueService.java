package com.drcarcare.service;

import com.drcarcare.dto.ServiceCatalogueRequest;
import com.drcarcare.dto.ServiceCatalogueResponse;
import com.drcarcare.entity.ServiceCatalogue;
import com.drcarcare.repository.ServiceCatalogueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceCatalogueService {

    private final ServiceCatalogueRepository serviceCatalogueRepository;
    private final AuditLogService auditLogService;


    // =========================================================
    // CREATE SERVICE
    // =========================================================

    public ServiceCatalogueResponse createService(
            ServiceCatalogueRequest request
    ) {

        if (serviceCatalogueRepository
                .existsByServiceNameIgnoreCase(request.getServiceName())) {

            throw new RuntimeException(
                    "Service already exists with name: "
                            + request.getServiceName()
            );
        }

        ServiceCatalogue service = new ServiceCatalogue();

        service.setServiceCode(generateServiceCode());
        service.setServiceName(request.getServiceName());
        service.setCategory(request.getCategory());
        service.setDescription(request.getDescription());
        service.setStandardPrice(request.getStandardPrice());
        service.setEstimatedHours(request.getEstimatedHours());
        service.setActive(true);

        LocalDateTime now = LocalDateTime.now();

        service.setCreatedAt(now);
        service.setUpdatedAt(now);

        ServiceCatalogue saved =
                serviceCatalogueRepository.save(service);

        auditLogService.log(
                "SERVICE_CREATED",
                "SERVICE_CATALOGUE",
                saved.getId(),
                "Service created: "
                        + saved.getServiceName()
                        + " (" + saved.getServiceCode() + ")",
                null,
                "Service Code: " + saved.getServiceCode()
                        + ", Name: " + saved.getServiceName()
                        + ", Category: " + saved.getCategory()
                        + ", Price: " + saved.getStandardPrice()
                        + ", Active: " + saved.getActive()
        );

        return mapToResponse(saved);
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @Transactional(readOnly = true)
    public List<ServiceCatalogueResponse> getAllServices() {

        return serviceCatalogueRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET ACTIVE
    // =========================================================

    @Transactional(readOnly = true)
    public List<ServiceCatalogueResponse> getActiveServices() {

        return serviceCatalogueRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public ServiceCatalogueResponse getServiceById(Long id) {

        ServiceCatalogue service = getEntityById(id);

        return mapToResponse(service);
    }


    // =========================================================
    // UPDATE SERVICE
    // =========================================================

    public ServiceCatalogueResponse updateService(
            Long id,
            ServiceCatalogueRequest request
    ) {

        ServiceCatalogue service = getEntityById(id);

        String oldValues =
                "Code: " + service.getServiceCode()
                        + ", Name: " + service.getServiceName()
                        + ", Category: " + service.getCategory()
                        + ", Price: " + service.getStandardPrice()
                        + ", Estimated Hours: "
                        + service.getEstimatedHours()
                        + ", Active: " + service.getActive();

        service.setServiceName(request.getServiceName());
        service.setCategory(request.getCategory());
        service.setDescription(request.getDescription());
        service.setStandardPrice(request.getStandardPrice());
        service.setEstimatedHours(request.getEstimatedHours());
        service.setUpdatedAt(LocalDateTime.now());

        ServiceCatalogue updated =
                serviceCatalogueRepository.save(service);

        String newValues =
                "Code: " + updated.getServiceCode()
                        + ", Name: " + updated.getServiceName()
                        + ", Category: " + updated.getCategory()
                        + ", Price: " + updated.getStandardPrice()
                        + ", Estimated Hours: "
                        + updated.getEstimatedHours()
                        + ", Active: " + updated.getActive();

        auditLogService.log(
                "SERVICE_UPDATED",
                "SERVICE_CATALOGUE",
                updated.getId(),
                "Service updated: "
                        + updated.getServiceName()
                        + " (" + updated.getServiceCode() + ")",
                oldValues,
                newValues
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // UPDATE SERVICE STATUS
    // =========================================================

    public ServiceCatalogueResponse updateServiceStatus(
            Long id,
            boolean active
    ) {

        ServiceCatalogue service = getEntityById(id);

        boolean oldStatus =
                Boolean.TRUE.equals(service.getActive());

        service.setActive(active);
        service.setUpdatedAt(LocalDateTime.now());

        ServiceCatalogue updated =
                serviceCatalogueRepository.save(service);

        auditLogService.log(
                "SERVICE_UPDATED",
                "SERVICE_CATALOGUE",
                updated.getId(),
                "Service status changed: "
                        + updated.getServiceName(),
                "Active: " + oldStatus,
                "Active: " + active
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // GET BY CATEGORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<ServiceCatalogueResponse> getServicesByCategory(
            String category
    ) {

        return serviceCatalogueRepository
                .findByCategoryIgnoreCase(category)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // FIND ENTITY
    // =========================================================

    private ServiceCatalogue getEntityById(Long id) {

        return serviceCatalogueRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Service not found with id: " + id
                        )
                );
    }


    // =========================================================
    // GENERATE SERVICE CODE
    // =========================================================

    private String generateServiceCode() {

        long nextId = serviceCatalogueRepository.count() + 1;

        String code;

        do {
            code = String.format("SRV-%06d", nextId);
            nextId++;
        } while (
                serviceCatalogueRepository
                        .findByServiceCode(code)
                        .isPresent()
        );

        return code;
    }


    // =========================================================
    // MAPPER
    // =========================================================

    private ServiceCatalogueResponse mapToResponse(
            ServiceCatalogue service
    ) {

        ServiceCatalogueResponse response =
                new ServiceCatalogueResponse();

        response.setId(service.getId());
        response.setServiceCode(service.getServiceCode());
        response.setServiceName(service.getServiceName());
        response.setCategory(service.getCategory());
        response.setDescription(service.getDescription());
        response.setStandardPrice(service.getStandardPrice());
        response.setEstimatedHours(service.getEstimatedHours());
        response.setActive(service.getActive());
        response.setCreatedAt(service.getCreatedAt());
        response.setUpdatedAt(service.getUpdatedAt());

        return response;
    }
}