package com.drcarcare.repository;

import com.drcarcare.entity.InventoryItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    boolean existsByPartCode(String partCode);

    Optional<InventoryItem> findByPartCode(String partCode);

    List<InventoryItem> findByActive(Boolean active);

    List<InventoryItem> findByCategoryIgnoreCase(String category);

    @Query("""
            SELECT i
            FROM InventoryItem i
            WHERE i.currentStock <= i.minimumStock
            AND i.active = true
            """)
    List<InventoryItem> findLowStockItems();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM InventoryItem i
            WHERE i.id = :id
            """)
    Optional<InventoryItem> findByIdForUpdate(@Param("id") Long id);
}