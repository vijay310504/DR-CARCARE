package com.drcarcare.repository;

import com.drcarcare.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository
        extends JpaRepository<PurchaseOrder, Long> {

    boolean existsByPurchaseNumber(String purchaseNumber);

    List<PurchaseOrder> findAllByOrderByPurchaseDateDesc();

    List<PurchaseOrder> findByVendorIdOrderByPurchaseDateDesc(
            Long vendorId
    );

    List<PurchaseOrder> findByStatusOrderByPurchaseDateDesc(
            String status
    );
}