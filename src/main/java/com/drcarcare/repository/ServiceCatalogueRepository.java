package com.drcarcare.repository;

import com.drcarcare.entity.ServiceCatalogue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceCatalogueRepository
        extends JpaRepository<ServiceCatalogue, Long> {

    Optional<ServiceCatalogue> findByServiceCode(String serviceCode);

    boolean existsByServiceNameIgnoreCase(String serviceName);

    List<ServiceCatalogue> findByActiveTrue();

    List<ServiceCatalogue> findByCategoryIgnoreCase(String category);
}