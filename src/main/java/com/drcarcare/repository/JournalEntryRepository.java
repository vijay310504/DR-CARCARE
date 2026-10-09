package com.drcarcare.repository;

import com.drcarcare.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface JournalEntryRepository
        extends JpaRepository<JournalEntry, Long> {

    boolean existsByEntryNumber(String entryNumber);

    List<JournalEntry>
    findAllByOrderByEntryDateDescIdDesc();

    List<JournalEntry>
    findByEntryDateBetweenOrderByEntryDateDescIdDesc(
            LocalDate fromDate,
            LocalDate toDate
    );

    List<JournalEntry>
    findByEntryTypeOrderByEntryDateDescIdDesc(
            String entryType
    );

    Optional<JournalEntry>
    findByReferenceTypeAndReferenceId(
            String referenceType,
            Long referenceId
    );
}