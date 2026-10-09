package com.drcarcare.controller;

import com.drcarcare.dto.AccountRequest;
import com.drcarcare.dto.AccountResponse;
import com.drcarcare.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody AccountRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        accountService.createAccount(request)
                );
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>>
    getAllAccounts() {

        return ResponseEntity.ok(
                accountService.getAllAccounts()
        );
    }

    @GetMapping("/active")
    public ResponseEntity<List<AccountResponse>>
    getActiveAccounts() {

        return ResponseEntity.ok(
                accountService.getActiveAccounts()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                accountService.getById(id)
        );
    }
}