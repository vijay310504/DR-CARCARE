package com.drcarcare.service;

import com.drcarcare.dto.AccountRequest;
import com.drcarcare.dto.AccountResponse;
import com.drcarcare.entity.Account;
import com.drcarcare.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional
    public AccountResponse createAccount(
            AccountRequest request
    ) {

        String code =
                request.getAccountCode()
                        .trim()
                        .toUpperCase();

        if (accountRepository.existsByAccountCode(code)) {
            throw new RuntimeException(
                    "Account code already exists: " + code
            );
        }

        Account parent = null;

        if (request.getParentAccountId() != null) {
            parent = accountRepository.findById(
                    request.getParentAccountId()
            ).orElseThrow(() ->
                    new RuntimeException(
                            "Parent account not found"
                    )
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        Account account =
                Account.builder()
                        .accountCode(code)
                        .accountName(
                                request.getAccountName().trim()
                        )
                        .accountType(
                                request.getAccountType()
                                        .trim()
                                        .toUpperCase()
                        )
                        .parentAccount(parent)
                        .active(
                                request.getActive() == null
                                        || request.getActive()
                        )
                        .description(request.getDescription())
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        return mapToResponse(
                accountRepository.save(account)
        );
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAllAccounts() {

        return accountRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getActiveAccounts() {

        return accountRepository
                .findByActiveTrueOrderByAccountCode()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountResponse getById(Long id) {

        return mapToResponse(
                getEntityById(id)
        );
    }

    private Account getEntityById(Long id) {

        return accountRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Account not found with id: " + id
                        )
                );
    }

    private AccountResponse mapToResponse(
            Account account
    ) {

        return AccountResponse.builder()
                .id(account.getId())
                .accountCode(account.getAccountCode())
                .accountName(account.getAccountName())
                .accountType(account.getAccountType())
                .parentAccountId(
                        account.getParentAccount() != null
                                ? account.getParentAccount().getId()
                                : null
                )
                .active(account.getActive())
                .description(account.getDescription())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}