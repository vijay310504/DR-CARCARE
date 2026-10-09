package com.drcarcare.repository;

import com.drcarcare.entity.VendorPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorPaymentRepository
        extends JpaRepository<VendorPayment, Long> {

    boolean existsByPaymentNumber(String paymentNumber);

    List<VendorPayment>
    findByVendorIdOrderByPaymentDateDesc(
            Long vendorId
    );
}