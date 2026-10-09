package com.drcarcare.repository;

import com.drcarcare.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryTransactionRepository
        extends JpaRepository<InventoryTransaction, Long> {

    List<InventoryTransaction> findByInventoryItemIdOrderByTransactionDateDesc(
            Long inventoryItemId
    );

    List<InventoryTransaction> findByTransactionType(String transactionType);

    List<InventoryTransaction> findByReferenceTypeAndReferenceId(
            String referenceType,
            Long referenceId
    );
}