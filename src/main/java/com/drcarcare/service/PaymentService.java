package com.drcarcare.service;

import com.drcarcare.dto.PaymentRequest;
import com.drcarcare.dto.PaymentResponse;
import com.drcarcare.entity.Invoice;
import com.drcarcare.entity.Payment;
import com.drcarcare.repository.InvoiceRepository;
import com.drcarcare.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final DayBookService dayBookService;
    private final AccountingService accountingService;
    private final AuditLogService auditLogService;


    // ===============A=============================================
    // CREATE PAYMENT
    // ============================================================

    @Transactional
    public PaymentResponse createPayment(
            Long invoiceId,
            PaymentRequest request
    ) {

        if (invoiceId == null) {
            throw new RuntimeException(
                    "Invoice ID is required"
            );
        }

        Invoice invoice =
                invoiceRepository.findById(invoiceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invoice not found with id: "
                                                + invoiceId
                                )
                        );
        if ("DRAFT".equalsIgnoreCase(invoice.getStatus())) {

            throw new RuntimeException(
                    "Payment cannot be recorded for a DRAFT invoice. Issue the invoice first."
            );
        }

        if ("CANCELLED".equalsIgnoreCase(invoice.getStatus())) {

            throw new RuntimeException(
                    "Payment cannot be recorded for a CANCELLED invoice."
            );
        }

        if ("PAID".equalsIgnoreCase(invoice.getStatus())) {

            throw new RuntimeException(
                    "Payment cannot be recorded for an already PAID invoice."
            );
        }

        if (request.getAmount() == null
                || request.getAmount()
                .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Payment amount must be greater than zero"
            );
        }

        BigDecimal paymentAmount =
                request.getAmount();

        BigDecimal outstandingAmount =
                invoice.getOutstandingAmount();

        if (paymentAmount.compareTo(
                outstandingAmount
        ) > 0) {

            throw new RuntimeException(
                    "Payment amount cannot exceed invoice outstanding amount"
            );
        }

        validatePaymentMethod(
                request.getPaymentMethod()
        );

        String paymentNumber =
                generatePaymentNumber();

        LocalDate paymentDate =
                request.getPaymentDate() != null
                        ? request.getPaymentDate()
                        : LocalDate.now();

        LocalDateTime now =
                LocalDateTime.now();

        Payment payment =
                Payment.builder()
                        .paymentNumber(
                                paymentNumber
                        )
                        .invoice(
                                invoice
                        )
                        .paymentDate(
                                paymentDate
                        )
                        .amount(
                                paymentAmount
                        )
                        .paymentMethod(
                                request.getPaymentMethod()
                                        .trim()
                                        .toUpperCase()
                        )
                        .referenceNumber(
                                request.getReferenceNumber()
                        )
                        .notes(
                                request.getNotes()
                        )
                        .createdAt(
                                now
                        )
                        .updatedAt(
                                now
                        )
                        .build();

        Payment savedPayment =
                paymentRepository.save(payment);

        BigDecimal newPaidAmount =
                invoice.getPaidAmount()
                        .add(paymentAmount);

        BigDecimal newOutstandingAmount =
                invoice.getTotalAmount()
                        .subtract(newPaidAmount);

        if (newOutstandingAmount.compareTo(
                BigDecimal.ZERO
        ) < 0) {
            newOutstandingAmount =
                    BigDecimal.ZERO;
        }

        invoice.setPaidAmount(
                newPaidAmount
        );

        invoice.setOutstandingAmount(
                newOutstandingAmount
        );

        if (newOutstandingAmount.compareTo(
                BigDecimal.ZERO
        ) == 0) {

            invoice.setStatus("PAID");

        } else if (newPaidAmount.compareTo(
                BigDecimal.ZERO
        ) > 0) {

            invoice.setStatus("PARTIALLY_PAID");
        }

        invoice.setUpdatedAt(
                LocalDateTime.now()
        );

        invoiceRepository.save(invoice);


        // ========================================================
        // DAY BOOK INTEGRATION
        // ========================================================

        dayBookService.createPaymentEntry(
                savedPayment.getId(),
                savedPayment.getPaymentDate(),
                "Customer payment for Invoice "
                        + invoice.getInvoiceNumber(),
                savedPayment.getAmount(),
                savedPayment.getPaymentMethod()
        );


        // ========================================================
        // ACCOUNTING INTEGRATION - V15
        // ========================================================

        accountingService.createJournalEntry(
                savedPayment.getPaymentDate(),
                "CUSTOMER_PAYMENT",
                "PAYMENT",
                savedPayment.getId(),
                "Customer payment for Invoice "
                        + invoice.getInvoiceNumber(),
                List.of(

                        new AccountingService.JournalLineData(
                                getPaymentAccountCode(
                                        savedPayment
                                                .getPaymentMethod()
                                ),
                                savedPayment.getAmount(),
                                BigDecimal.ZERO,
                                "Customer payment"
                        ),

                        new AccountingService.JournalLineData(
                                "1100",
                                BigDecimal.ZERO,
                                savedPayment.getAmount(),
                                "Accounts receivable settlement"
                        )
                )
        );


        // ========================================================
        // AUDIT
        // ========================================================

        auditLogService.log(
                "PAYMENT_RECEIVED",
                "PAYMENT",
                savedPayment.getId(),
                "Customer payment received for Invoice "
                        + invoice.getInvoiceNumber(),
                "Invoice Outstanding Before: "
                        + outstandingAmount,
                "Payment Amount: " + savedPayment.getAmount()
                        + ", Invoice Paid Amount: "
                        + invoice.getPaidAmount()
                        + ", Invoice Outstanding After: "
                        + invoice.getOutstandingAmount()
                        + ", Invoice Status: "
                        + invoice.getStatus()
        );

        return mapToResponse(
                savedPayment
        );
    }


    // ============================================================
    // GET ALL PAYMENTS FOR INVOICE
    // ============================================================

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByInvoice(
            Long invoiceId
    ) {

        if (invoiceId == null) {
            throw new RuntimeException(
                    "Invoice ID is required"
            );
        }

        if (!invoiceRepository.existsById(invoiceId)) {
            throw new RuntimeException(
                    "Invoice not found with id: "
                            + invoiceId
            );
        }

        return paymentRepository
                .findByInvoiceIdOrderByPaymentDateDesc(
                        invoiceId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ============================================================
    // GET PAYMENT BY ID
    // ============================================================

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(
            Long id
    ) {

        return mapToResponse(
                getEntityById(id)
        );
    }


    // ============================================================
    // GET ALL PAYMENTS
    // ============================================================

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {

        return paymentRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ============================================================
    // PAYMENT ACCOUNT CODE
    // ============================================================

    private String getPaymentAccountCode(
            String paymentMethod
    ) {

        return accountingService
                .getPaymentAccountCode(
                        paymentMethod
                );
    }


    // ============================================================
    // VALIDATE PAYMENT METHOD
    // ============================================================

    private void validatePaymentMethod(
            String paymentMethod
    ) {

        if (paymentMethod == null
                || paymentMethod.isBlank()) {

            throw new RuntimeException(
                    "Payment method is required"
            );
        }

        String method =
                paymentMethod
                        .trim()
                        .toUpperCase();

        if (!method.equals("CASH")
                && !method.equals("UPI")
                && !method.equals("CARD")
                && !method.equals("BANK_TRANSFER")) {

            throw new RuntimeException(
                    "Invalid payment method: "
                            + paymentMethod
            );
        }
    }


    // ============================================================
    // FIND PAYMENT ENTITY
    // ============================================================

    private Payment getEntityById(
            Long id
    ) {

        return paymentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found with id: "
                                        + id
                        )
                );
    }


    // ============================================================
    // GENERATE PAYMENT NUMBER
    // ============================================================

    private String generatePaymentNumber() {

        long nextNumber =
                paymentRepository.count() + 1;

        String paymentNumber;

        do {

            paymentNumber =
                    String.format(
                            "PAY-%06d",
                            nextNumber++
                    );

        } while (
                paymentRepository
                        .existsByPaymentNumber(
                                paymentNumber
                        )
        );

        return paymentNumber;
    }


    // ============================================================
    // MAP ENTITY → RESPONSE
    // ============================================================

    private PaymentResponse mapToResponse(
            Payment payment
    ) {

        return PaymentResponse.builder()
                .id(
                        payment.getId()
                )
                .paymentNumber(
                        payment.getPaymentNumber()
                )
                .invoiceId(
                        payment.getInvoice().getId()
                )
                .invoiceNumber(
                        payment.getInvoice().getInvoiceNumber()
                )
                .paymentDate(
                        payment.getPaymentDate()
                )
                .amount(
                        payment.getAmount()
                )
                .paymentMethod(
                        payment.getPaymentMethod()
                )
                .referenceNumber(
                        payment.getReferenceNumber()
                )
                .notes(
                        payment.getNotes()
                )
                .createdAt(
                        payment.getCreatedAt()
                )
                .updatedAt(
                        payment.getUpdatedAt()
                )
                .build();
    }
}