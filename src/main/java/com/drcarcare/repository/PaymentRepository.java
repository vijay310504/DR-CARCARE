package com.drcarcare.repository;

import com.drcarcare.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    boolean existsByPaymentNumber(String paymentNumber);

    List<Payment> findByInvoiceIdOrderByPaymentDateDesc(
            Long invoiceId
    );
}