package com.drcarcare.repository;

import com.drcarcare.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorRepository
        extends JpaRepository<Vendor, Long> {

    boolean existsByVendorCode(String vendorCode);

    boolean existsByVendorNameIgnoreCase(String vendorName);

    List<Vendor> findByStatus(String status);

    List<Vendor> findByVendorNameContainingIgnoreCase(
            String vendorName
    );

    List<Vendor> findByCategoryIgnoreCase(
            String category
    );

    List<Vendor> findByStatusAndCategoryIgnoreCase(
            String status,
            String category
    );
}