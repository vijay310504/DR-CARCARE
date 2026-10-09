package com.drcarcare.repository;

import com.drcarcare.entity.DayBookEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DayBookEntryRepository
        extends JpaRepository<DayBookEntry, Long> {

    boolean existsByEntryNumber(String entryNumber);

    List<DayBookEntry> findAllByOrderByEntryDateDescIdDesc();

    List<DayBookEntry>
    findByEntryDateBetweenOrderByEntryDateDescIdDesc(
            LocalDate fromDate,
            LocalDate toDate
    );

    List<DayBookEntry>
    findByEntryTypeOrderByEntryDateDescIdDesc(
            String entryType
    );
}