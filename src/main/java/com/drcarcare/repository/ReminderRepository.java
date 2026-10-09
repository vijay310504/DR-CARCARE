package com.drcarcare.repository;

import com.drcarcare.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReminderRepository
        extends JpaRepository<Reminder, Long> {

    List<Reminder> findByStatusOrderByDueDateAsc(
            String status
    );

    List<Reminder> findByDueDateOrderByPriorityDesc(
            LocalDate dueDate
    );

    List<Reminder> findByDueDateBeforeAndStatusOrderByDueDateAsc(
            LocalDate dueDate,
            String status
    );

    List<Reminder> findByCustomerIdOrderByDueDateDesc(
            Long customerId
    );

    List<Reminder> findByVehicleIdOrderByDueDateDesc(
            Long vehicleId
    );

    List<Reminder> findByReminderTypeAndStatusOrderByDueDateAsc(
            String reminderType,
            String status
    );
}