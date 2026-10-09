package com.drcarcare.service;

import com.drcarcare.dto.CustomerRequest;
import com.drcarcare.dto.CustomerResponse;
import com.drcarcare.entity.Customer;
import com.drcarcare.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AuditLogService auditLogService;


    // =========================================================
    // CREATE CUSTOMER
    // =========================================================

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {

        // Check duplicate email
        if (request.getEmail() != null &&
                !request.getEmail().isBlank() &&
                customerRepository.existsByEmail(request.getEmail())) {

            throw new RuntimeException(
                    "Customer already exists with email: "
                            + request.getEmail()
            );
        }

        LocalDateTime now = LocalDateTime.now();

        // Generate customer code
        String customerCode = generateCustomerCode();

        Customer customer = Customer.builder()
                .customerCode(customerCode)
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .alternatePhone(request.getAlternatePhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .notes(request.getNotes())
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        Customer savedCustomer =
                customerRepository.save(customer);

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.log(
                "CUSTOMER_CREATED",
                "CUSTOMER",
                savedCustomer.getId(),
                "Customer created: "
                        + savedCustomer.getName()
                        + " (" + savedCustomer.getCustomerCode() + ")",
                null,
                "Customer ID: " + savedCustomer.getId()
                        + ", Code: " + savedCustomer.getCustomerCode()
        );

        return mapToResponse(savedCustomer);
    }


    // =========================================================
    // GET ALL CUSTOMERS
    // =========================================================

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {

        return customerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET CUSTOMER BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: " + id
                        )
                );

        return mapToResponse(customer);
    }


    // =========================================================
    // UPDATE CUSTOMER
    // =========================================================

    @Transactional
    public CustomerResponse updateCustomer(
            Long id,
            CustomerRequest request
    ) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: " + id
                        )
                );

        // Capture old values before update
        String oldValues =
                "name=" + customer.getName()
                        + ", email=" + customer.getEmail()
                        + ", phone=" + customer.getPhone()
                        + ", alternatePhone=" + customer.getAlternatePhone()
                        + ", address=" + customer.getAddress()
                        + ", city=" + customer.getCity()
                        + ", state=" + customer.getState()
                        + ", pincode=" + customer.getPincode()
                        + ", active=" + customer.getActive();

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAlternatePhone(
                request.getAlternatePhone()
        );
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setPincode(request.getPincode());
        customer.setNotes(request.getNotes());
        customer.setUpdatedAt(LocalDateTime.now());

        Customer updatedCustomer =
                customerRepository.save(customer);

        // Capture new values after update
        String newValues =
                "name=" + updatedCustomer.getName()
                        + ", email=" + updatedCustomer.getEmail()
                        + ", phone=" + updatedCustomer.getPhone()
                        + ", alternatePhone=" + updatedCustomer.getAlternatePhone()
                        + ", address=" + updatedCustomer.getAddress()
                        + ", city=" + updatedCustomer.getCity()
                        + ", state=" + updatedCustomer.getState()
                        + ", pincode=" + updatedCustomer.getPincode()
                        + ", active=" + updatedCustomer.getActive();

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.log(
                "CUSTOMER_UPDATED",
                "CUSTOMER",
                updatedCustomer.getId(),
                "Customer updated: "
                        + updatedCustomer.getName()
                        + " (" + updatedCustomer.getCustomerCode() + ")",
                oldValues,
                newValues
        );

        return mapToResponse(updatedCustomer);
    }


    // =========================================================
    // DEACTIVATE CUSTOMER
    // =========================================================

    @Transactional
    public void deactivateCustomer(Long id) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: " + id
                        )
                );

        customer.setActive(false);
        customer.setUpdatedAt(LocalDateTime.now());

        customerRepository.save(customer);

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.log(
                "CUSTOMER_DELETED",
                "CUSTOMER",
                customer.getId(),
                "Customer deactivated: "
                        + customer.getName()
                        + " (" + customer.getCustomerCode() + ")",
                "active=true",
                "active=false"
        );
    }


    // =========================================================
    // SEARCH CUSTOMERS
    // =========================================================

    @Transactional(readOnly = true)
    public List<CustomerResponse> searchCustomers(
            String keyword
    ) {

        return customerRepository
                .findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GENERATE CUSTOMER CODE
    // =========================================================

    private String generateCustomerCode() {

        long nextNumber =
                customerRepository.count() + 1;

        String customerCode =
                "CUS-" + String.format("%06d", nextNumber);

        while (customerRepository.existsByCustomerCode(customerCode)) {

            nextNumber++;

            customerCode =
                    "CUS-" + String.format("%06d", nextNumber);
        }

        return customerCode;
    }


    // =========================================================
    // ENTITY → RESPONSE DTO
    // =========================================================

    private CustomerResponse mapToResponse(
            Customer customer
    ) {

        return CustomerResponse.builder()
                .id(customer.getId())
                .customerCode(customer.getCustomerCode())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .alternatePhone(
                        customer.getAlternatePhone()
                )
                .address(customer.getAddress())
                .city(customer.getCity())
                .state(customer.getState())
                .pincode(customer.getPincode())
                .notes(customer.getNotes())
                .active(customer.getActive())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}