package com.drcarcare.repository;

import com.drcarcare.entity.PurchaseItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseItemRepository
        extends JpaRepository<PurchaseItem, Long> {

    List<PurchaseItem> findByPurchaseOrderId(Long purchaseOrderId);

    List<PurchaseItem> findByInventoryItemId(Long inventoryItemId);
}