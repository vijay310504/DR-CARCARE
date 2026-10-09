package com.drcarcare.repository;

import com.drcarcare.entity.JournalEntryLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalEntryLineRepository
        extends JpaRepository<JournalEntryLine, Long> {

    List<JournalEntryLine>
    findByJournalEntryId(Long journalEntryId);

    List<JournalEntryLine>
    findByAccountId(Long accountId);
}