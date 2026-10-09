package com.drcarcare.repository;

import com.drcarcare.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    boolean existsByVehicleNumber(String vehicleNumber);

    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);

    List<Vehicle> findByCustomerId(Long customerId);

    List<Vehicle> findByVehicleNumberContainingIgnoreCase(
            String vehicleNumber
    );

    List<Vehicle> findByMakeContainingIgnoreCaseOrModelContainingIgnoreCase(
            String make,
            String model
    );
}