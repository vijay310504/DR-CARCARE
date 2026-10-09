package com.drcarcare.service;

import com.drcarcare.dto.ReminderRequest;
import com.drcarcare.dto.ReminderResponse;
import com.drcarcare.entity.Customer;
import com.drcarcare.entity.Reminder;
import com.drcarcare.entity.Vehicle;
import com.drcarcare.repository.CustomerRepository;
import com.drcarcare.repository.ReminderRepository;
import com.drcarcare.repository.VehicleRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final AuditLogService auditLogService;


    // =========================================================
    // CREATE
    // =========================================================

    @Transactional
    public ReminderResponse createReminder(
            ReminderRequest request
    ) {

        validateType(request.getReminderType());

        String status = normalizeStatus(
                request.getStatus()
        );

        String priority = normalizePriority(
                request.getPriority()
        );

        Customer customer =
                customerRepository.findById(
                        request.getCustomerId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: "
                                        + request.getCustomerId()
                        )
                );

        Vehicle vehicle = null;

        if (request.getVehicleId() != null) {

            vehicle =
                    vehicleRepository.findById(
                            request.getVehicleId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Vehicle not found with id: "
                                            + request.getVehicleId()
                            )
                    );
        }

        LocalDateTime now =
                LocalDateTime.now();

        Reminder reminder =
                Reminder.builder()
                        .customer(customer)
                        .vehicle(vehicle)
                        .reminderType(
                                request.getReminderType()
                                        .trim()
                                        .toUpperCase()
                        )
                        .title(
                                request.getTitle().trim()
                        )
                        .description(
                                request.getDescription()
                        )
                        .dueDate(
                                request.getDueDate()
                        )
                        .status(status)
                        .priority(priority)
                        .notes(request.getNotes())
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        Reminder savedReminder =
                reminderRepository.save(reminder);

        auditLogService.log(
                "REMINDER_CREATED",
                "REMINDER",
                savedReminder.getId(),
                "Reminder created: "
                        + savedReminder.getTitle(),
                null,
                "Customer ID: "
                        + customer.getId()
                        + ", Reminder Type: "
                        + savedReminder.getReminderType()
                        + ", Due Date: "
                        + savedReminder.getDueDate()
        );

        return mapToResponse(savedReminder);
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @Transactional(readOnly = true)
    public List<ReminderResponse> getAllReminders() {

        return reminderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public ReminderResponse getReminderById(
            Long id
    ) {

        return mapToResponse(
                getEntityById(id)
        );
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @Transactional
    public ReminderResponse updateReminder(
            Long id,
            ReminderRequest request
    ) {

        Reminder reminder =
                getEntityById(id);

        String oldValues =
                "Customer ID: " + reminder.getCustomer().getId()
                        + ", Vehicle ID: "
                        + (reminder.getVehicle() != null
                        ? reminder.getVehicle().getId()
                        : null)
                        + ", Type: " + reminder.getReminderType()
                        + ", Title: " + reminder.getTitle()
                        + ", Due Date: " + reminder.getDueDate()
                        + ", Status: " + reminder.getStatus()
                        + ", Priority: " + reminder.getPriority();

        validateType(request.getReminderType());

        Customer customer =
                customerRepository.findById(
                        request.getCustomerId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: "
                                        + request.getCustomerId()
                        )
                );

        Vehicle vehicle = null;

        if (request.getVehicleId() != null) {

            vehicle =
                    vehicleRepository.findById(
                            request.getVehicleId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Vehicle not found with id: "
                                            + request.getVehicleId()
                            )
                    );
        }

        String status =
                normalizeStatus(
                        request.getStatus()
                );

        String priority =
                normalizePriority(
                        request.getPriority()
                );

        reminder.setCustomer(customer);
        reminder.setVehicle(vehicle);

        reminder.setReminderType(
                request.getReminderType()
                        .trim()
                        .toUpperCase()
        );

        reminder.setTitle(
                request.getTitle().trim()
        );

        reminder.setDescription(
                request.getDescription()
        );

        reminder.setDueDate(
                request.getDueDate()
        );

        reminder.setStatus(status);
        reminder.setPriority(priority);
        reminder.setNotes(request.getNotes());
        reminder.setUpdatedAt(
                LocalDateTime.now()
        );

        if (!"COMPLETED".equals(status)) {
            reminder.setCompletedAt(null);
        }

        Reminder updatedReminder =
                reminderRepository.save(reminder);

        String newValues =
                "Customer ID: " + updatedReminder.getCustomer().getId()
                        + ", Vehicle ID: "
                        + (updatedReminder.getVehicle() != null
                        ? updatedReminder.getVehicle().getId()
                        : null)
                        + ", Type: " + updatedReminder.getReminderType()
                        + ", Title: " + updatedReminder.getTitle()
                        + ", Due Date: " + updatedReminder.getDueDate()
                        + ", Status: " + updatedReminder.getStatus()
                        + ", Priority: " + updatedReminder.getPriority();

        auditLogService.log(
                "REMINDER_UPDATED",
                "REMINDER",
                updatedReminder.getId(),
                "Reminder updated: "
                        + updatedReminder.getTitle(),
                oldValues,
                newValues
        );

        return mapToResponse(updatedReminder);
    }


    // =========================================================
    // COMPLETE
    // =========================================================

    @Transactional
    public ReminderResponse completeReminder(
            Long id
    ) {

        Reminder reminder =
                getEntityById(id);

        String oldStatus = reminder.getStatus();

        reminder.setStatus("COMPLETED");

        reminder.setCompletedAt(
                LocalDateTime.now()
        );

        reminder.setUpdatedAt(
                LocalDateTime.now()
        );

        Reminder completedReminder =
                reminderRepository.save(reminder);

        auditLogService.log(
                "REMINDER_COMPLETED",
                "REMINDER",
                completedReminder.getId(),
                "Reminder completed: "
                        + completedReminder.getTitle(),
                "Status: " + oldStatus,
                "Status: COMPLETED"
        );

        return mapToResponse(completedReminder);
    }


    // =========================================================
    // CANCEL
    // =========================================================

    @Transactional
    public ReminderResponse cancelReminder(
            Long id
    ) {

        Reminder reminder =
                getEntityById(id);

        String oldStatus = reminder.getStatus();

        reminder.setStatus("CANCELLED");

        reminder.setCompletedAt(null);

        reminder.setUpdatedAt(
                LocalDateTime.now()
        );

        Reminder cancelledReminder =
                reminderRepository.save(reminder);

        auditLogService.log(
                "REMINDER_CANCELLED",
                "REMINDER",
                cancelledReminder.getId(),
                "Reminder cancelled: "
                        + cancelledReminder.getTitle(),
                "Status: " + oldStatus,
                "Status: CANCELLED"
        );

        return mapToResponse(cancelledReminder);
    }


    // =========================================================
    // PENDING
    // =========================================================

    @Transactional(readOnly = true)
    public List<ReminderResponse> getPendingReminders() {

        return reminderRepository
                .findByStatusOrderByDueDateAsc(
                        "PENDING"
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // TODAY
    // =========================================================

    @Transactional(readOnly = true)
    public List<ReminderResponse> getTodayReminders() {

        return reminderRepository
                .findByDueDateOrderByPriorityDesc(
                        LocalDate.now()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // OVERDUE
    // =========================================================

    @Transactional(readOnly = true)
    public List<ReminderResponse> getOverdueReminders() {

        return reminderRepository
                .findByDueDateBeforeAndStatusOrderByDueDateAsc(
                        LocalDate.now(),
                        "PENDING"
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // BY CUSTOMER
    // =========================================================

    @Transactional(readOnly = true)
    public List<ReminderResponse> getByCustomer(
            Long customerId
    ) {

        if (!customerRepository.existsById(customerId)) {

            throw new RuntimeException(
                    "Customer not found with id: "
                            + customerId
            );
        }

        return reminderRepository
                .findByCustomerIdOrderByDueDateDesc(
                        customerId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // BY VEHICLE
    // =========================================================

    @Transactional(readOnly = true)
    public List<ReminderResponse> getByVehicle(
            Long vehicleId
    ) {

        if (!vehicleRepository.existsById(vehicleId)) {

            throw new RuntimeException(
                    "Vehicle not found with id: "
                            + vehicleId
            );
        }

        return reminderRepository
                .findByVehicleIdOrderByDueDateDesc(
                        vehicleId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // DELETE
    // =========================================================

    @Transactional
    public void deleteReminder(
            Long id
    ) {

        Reminder reminder =
                getEntityById(id);

        auditLogService.log(
                "REMINDER_CANCELLED",
                "REMINDER",
                reminder.getId(),
                "Reminder deleted: "
                        + reminder.getTitle(),
                "Status: " + reminder.getStatus(),
                "Reminder deleted"
        );

        reminderRepository.delete(reminder);
    }


    // =========================================================
    // FIND ENTITY
    // =========================================================

    private Reminder getEntityById(
            Long id
    ) {

        return reminderRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Reminder not found with id: "
                                        + id
                        )
                );
    }


    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateType(
            String type
    ) {

        if (type == null) {

            throw new RuntimeException(
                    "Reminder type is required"
            );
        }

        String normalized =
                type.trim().toUpperCase();

        if (!normalized.equals("SERVICE")
                && !normalized.equals("FOLLOW_UP")
                && !normalized.equals("PAYMENT")
                && !normalized.equals("ESTIMATE")
                && !normalized.equals("DELIVERY")
                && !normalized.equals("GENERAL")) {

            throw new RuntimeException(
                    "Invalid reminder type: "
                            + type
            );
        }
    }


    private String normalizeStatus(
            String status
    ) {

        if (status == null
                || status.isBlank()) {

            return "PENDING";
        }

        String normalized =
                status.trim().toUpperCase();

        if (!normalized.equals("PENDING")
                && !normalized.equals("COMPLETED")
                && !normalized.equals("CANCELLED")) {

            throw new RuntimeException(
                    "Invalid reminder status: "
                            + status
            );
        }

        return normalized;
    }


    private String normalizePriority(
            String priority
    ) {

        if (priority == null
                || priority.isBlank()) {

            return "MEDIUM";
        }

        String normalized =
                priority.trim().toUpperCase();

        if (!normalized.equals("LOW")
                && !normalized.equals("MEDIUM")
                && !normalized.equals("HIGH")) {

            throw new RuntimeException(
                    "Invalid reminder priority: "
                            + priority
            );
        }

        return normalized;
    }


    // =========================================================
    // MAPPER
    // =========================================================

    private ReminderResponse mapToResponse(
            Reminder reminder
    ) {

        Customer customer =
                reminder.getCustomer();

        Vehicle vehicle =
                reminder.getVehicle();

        LocalDate today =
                LocalDate.now();

        boolean overdue =
                "PENDING".equals(
                        reminder.getStatus()
                )
                        && reminder.getDueDate()
                        .isBefore(today);

        return ReminderResponse.builder()
                .id(reminder.getId())

                .customerId(
                        customer.getId()
                )

                .customerName(
                        customer.getName()
                )

                .vehicleId(
                        vehicle != null
                                ? vehicle.getId()
                                : null
                )

                .reminderType(
                        reminder.getReminderType()
                )

                .title(
                        reminder.getTitle()
                )

                .description(
                        reminder.getDescription()
                )

                .dueDate(
                        reminder.getDueDate()
                )

                .status(
                        reminder.getStatus()
                )

                .priority(
                        reminder.getPriority()
                )

                .completedAt(
                        reminder.getCompletedAt()
                )

                .notes(
                        reminder.getNotes()
                )

                .createdAt(
                        reminder.getCreatedAt()
                )

                .updatedAt(
                        reminder.getUpdatedAt()
                )

                .overdue(overdue)

                .build();
    }
}