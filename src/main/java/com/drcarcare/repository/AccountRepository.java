package com.drcarcare.repository;

import com.drcarcare.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository
        extends JpaRepository<Account, Long> {

    boolean existsByAccountCode(String accountCode);

    Optional<Account> findByAccountCode(String accountCode);

    List<Account> findByAccountTypeOrderByAccountCode(
            String accountType
    );

    List<Account> findByActiveTrueOrderByAccountCode();
}