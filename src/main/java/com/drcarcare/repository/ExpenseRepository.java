package com.drcarcare.repository;

import com.drcarcare.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository
        extends JpaRepository<Expense, Long> {

    boolean existsByExpenseNumber(String expenseNumber);

    List<Expense> findAllByOrderByExpenseDateDesc();

    List<Expense> findByCategoryOrderByExpenseDateDesc(
            String category
    );

    List<Expense> findByExpenseDateBetweenOrderByExpenseDateDesc(
            LocalDate fromDate,
            LocalDate toDate
    );
}