package com.drcarcare.service;

import com.drcarcare.dto.VehicleRequest;
import com.drcarcare.dto.VehicleResponse;
import com.drcarcare.entity.Customer;
import com.drcarcare.entity.Vehicle;
import com.drcarcare.repository.CustomerRepository;
import com.drcarcare.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final AuditLogService auditLogService;


    // =========================================================
    // CREATE VEHICLE
    // =========================================================

    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request) {

        // Check duplicate vehicle number
        if (vehicleRepository.existsByVehicleNumber(
                request.getVehicleNumber()
        )) {

            throw new RuntimeException(
                    "Vehicle already exists with number: "
                            + request.getVehicleNumber()
            );
        }

        // Find customer
        Customer customer = customerRepository
                .findById(request.getCustomerId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: "
                                        + request.getCustomerId()
                        )
                );

        LocalDateTime now = LocalDateTime.now();

        Vehicle vehicle = Vehicle.builder()
                .vehicleNumber(request.getVehicleNumber())
                .make(request.getMake())
                .model(request.getModel())
                .variant(request.getVariant())
                .manufacturingYear(
                        request.getManufacturingYear()
                )
                .color(request.getColor())
                .fuelType(request.getFuelType())
                .vin(request.getVin())
                .engineNumber(request.getEngineNumber())
                .currentMileage(request.getCurrentMileage())
                .customer(customer)
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        Vehicle savedVehicle =
                vehicleRepository.save(vehicle);

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.log(
                "VEHICLE_CREATED",
                "VEHICLE",
                savedVehicle.getId(),
                "Vehicle created: "
                        + savedVehicle.getVehicleNumber(),
                null,
                "Vehicle ID: " + savedVehicle.getId()
                        + ", Number: "
                        + savedVehicle.getVehicleNumber()
        );

        return mapToResponse(savedVehicle);
    }


    // =========================================================
    // GET ALL VEHICLES
    // =========================================================

    @Transactional(readOnly = true)
    public List<VehicleResponse> getAllVehicles() {

        return vehicleRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET VEHICLE BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Long id) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vehicle not found with id: " + id
                        )
                );

        return mapToResponse(vehicle);
    }


    // =========================================================
    // UPDATE VEHICLE
    // =========================================================

    @Transactional
    public VehicleResponse updateVehicle(
            Long id,
            VehicleRequest request
    ) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vehicle not found with id: " + id
                        )
                );

        // Capture old values
        String oldValues =
                "vehicleNumber=" + vehicle.getVehicleNumber()
                        + ", make=" + vehicle.getMake()
                        + ", model=" + vehicle.getModel()
                        + ", variant=" + vehicle.getVariant()
                        + ", manufacturingYear=" + vehicle.getManufacturingYear()
                        + ", color=" + vehicle.getColor()
                        + ", fuelType=" + vehicle.getFuelType()
                        + ", vin=" + vehicle.getVin()
                        + ", engineNumber=" + vehicle.getEngineNumber()
                        + ", currentMileage=" + vehicle.getCurrentMileage()
                        + ", customerId="
                        + (vehicle.getCustomer() != null
                        ? vehicle.getCustomer().getId()
                        : null)
                        + ", active=" + vehicle.getActive();

        // Check vehicle number if it is being changed
        if (!vehicle.getVehicleNumber()
                .equalsIgnoreCase(request.getVehicleNumber())) {

            if (vehicleRepository.existsByVehicleNumber(
                    request.getVehicleNumber()
            )) {

                throw new RuntimeException(
                        "Vehicle already exists with number: "
                                + request.getVehicleNumber()
                );
            }
        }

        // Find customer
        Customer customer = customerRepository
                .findById(request.getCustomerId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: "
                                        + request.getCustomerId()
                        )
                );

        vehicle.setVehicleNumber(
                request.getVehicleNumber()
        );

        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setVariant(request.getVariant());

        vehicle.setManufacturingYear(
                request.getManufacturingYear()
        );

        vehicle.setColor(request.getColor());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setVin(request.getVin());

        vehicle.setEngineNumber(
                request.getEngineNumber()
        );

        vehicle.setCurrentMileage(
                request.getCurrentMileage()
        );

        vehicle.setCustomer(customer);

        vehicle.setUpdatedAt(LocalDateTime.now());

        Vehicle updatedVehicle =
                vehicleRepository.save(vehicle);

        // Capture new values
        String newValues =
                "vehicleNumber=" + updatedVehicle.getVehicleNumber()
                        + ", make=" + updatedVehicle.getMake()
                        + ", model=" + updatedVehicle.getModel()
                        + ", variant=" + updatedVehicle.getVariant()
                        + ", manufacturingYear="
                        + updatedVehicle.getManufacturingYear()
                        + ", color=" + updatedVehicle.getColor()
                        + ", fuelType=" + updatedVehicle.getFuelType()
                        + ", vin=" + updatedVehicle.getVin()
                        + ", engineNumber="
                        + updatedVehicle.getEngineNumber()
                        + ", currentMileage="
                        + updatedVehicle.getCurrentMileage()
                        + ", customerId="
                        + (updatedVehicle.getCustomer() != null
                        ? updatedVehicle.getCustomer().getId()
                        : null)
                        + ", active=" + updatedVehicle.getActive();

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.log(
                "VEHICLE_UPDATED",
                "VEHICLE",
                updatedVehicle.getId(),
                "Vehicle updated: "
                        + updatedVehicle.getVehicleNumber(),
                oldValues,
                newValues
        );

        return mapToResponse(updatedVehicle);
    }


    // =========================================================
    // DEACTIVATE VEHICLE
    // =========================================================

    @Transactional
    public void deactivateVehicle(Long id) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vehicle not found with id: " + id
                        )
                );

        vehicle.setActive(false);
        vehicle.setUpdatedAt(LocalDateTime.now());

        vehicleRepository.save(vehicle);

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.log(
                "VEHICLE_DELETED",
                "VEHICLE",
                vehicle.getId(),
                "Vehicle deactivated: "
                        + vehicle.getVehicleNumber(),
                "active=true",
                "active=false"
        );
    }


    // =========================================================
    // GET VEHICLES BY CUSTOMER
    // =========================================================

    @Transactional(readOnly = true)
    public List<VehicleResponse> getVehiclesByCustomer(
            Long customerId
    ) {

        // Verify customer exists
        if (!customerRepository.existsById(customerId)) {

            throw new RuntimeException(
                    "Customer not found with id: "
                            + customerId
            );
        }

        return vehicleRepository
                .findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // SEARCH VEHICLES
    // =========================================================

    @Transactional(readOnly = true)
    public List<VehicleResponse> searchVehicles(
            String keyword
    ) {

        List<Vehicle> vehicles =
                vehicleRepository
                        .findByVehicleNumberContainingIgnoreCase(
                                keyword
                        );

        return vehicles
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // ENTITY → RESPONSE DTO
    // =========================================================

    private VehicleResponse mapToResponse(
            Vehicle vehicle
    ) {

        return VehicleResponse.builder()
                .id(vehicle.getId())
                .vehicleNumber(
                        vehicle.getVehicleNumber()
                )
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .variant(vehicle.getVariant())
                .manufacturingYear(
                        vehicle.getManufacturingYear()
                )
                .color(vehicle.getColor())
                .fuelType(vehicle.getFuelType())
                .vin(vehicle.getVin())
                .engineNumber(
                        vehicle.getEngineNumber()
                )
                .currentMileage(
                        vehicle.getCurrentMileage()
                )
                .customerId(
                        vehicle.getCustomer().getId()
                )
                .customerName(
                        vehicle.getCustomer().getName()
                )
                .active(vehicle.getActive())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}