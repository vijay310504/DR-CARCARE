CREATE TABLE accounts (
                          id BIGINT NOT NULL AUTO_INCREMENT,
                          account_code VARCHAR(20) NOT NULL,
                          account_name VARCHAR(150) NOT NULL,
                          account_type VARCHAR(30) NOT NULL,
                          parent_account_id BIGINT,
                          active BOOLEAN NOT NULL DEFAULT TRUE,
                          description VARCHAR(500),
                          created_at DATETIME NOT NULL,
                          updated_at DATETIME NOT NULL,

                          PRIMARY KEY (id),

                          CONSTRAINT uk_accounts_code
                              UNIQUE (account_code),

                          CONSTRAINT fk_accounts_parent
                              FOREIGN KEY (parent_account_id)
                                  REFERENCES accounts(id),

                          INDEX idx_accounts_type (account_type),
                          INDEX idx_accounts_active (active)
);


CREATE TABLE journal_entries (
                                 id BIGINT NOT NULL AUTO_INCREMENT,
                                 entry_number VARCHAR(30) NOT NULL,
                                 entry_date DATE NOT NULL,
                                 entry_type VARCHAR(30) NOT NULL,
                                 reference_type VARCHAR(30),
                                 reference_id BIGINT,
                                 description VARCHAR(500) NOT NULL,
                                 created_at DATETIME NOT NULL,
                                 updated_at DATETIME NOT NULL,

                                 PRIMARY KEY (id),

                                 CONSTRAINT uk_journal_entries_number
                                     UNIQUE (entry_number),

                                 INDEX idx_journal_entries_date (entry_date),
                                 INDEX idx_journal_entries_type (entry_type),
                                 INDEX idx_journal_entries_reference
                                     (reference_type, reference_id)
);


CREATE TABLE journal_entry_lines (
                                     id BIGINT NOT NULL AUTO_INCREMENT,
                                     journal_entry_id BIGINT NOT NULL,
                                     account_id BIGINT NOT NULL,
                                     debit_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
                                     credit_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
                                     description VARCHAR(500),

                                     PRIMARY KEY (id),

                                     CONSTRAINT fk_journal_lines_entry
                                         FOREIGN KEY (journal_entry_id)
                                             REFERENCES journal_entries(id),

                                     CONSTRAINT fk_journal_lines_account
                                         FOREIGN KEY (account_id)
                                             REFERENCES accounts(id),

                                     INDEX idx_journal_lines_entry
                                         (journal_entry_id),

                                     INDEX idx_journal_lines_account
                                         (account_id)
);


CREATE TABLE vendor_payments (
                                 id BIGINT NOT NULL AUTO_INCREMENT,
                                 payment_number VARCHAR(30) NOT NULL,
                                 vendor_id BIGINT NOT NULL,
                                 payment_date DATE NOT NULL,
                                 amount DECIMAL(15,2) NOT NULL,
                                 payment_method VARCHAR(30) NOT NULL,
                                 reference_number VARCHAR(100),
                                 notes VARCHAR(1000),
                                 created_at DATETIME NOT NULL,
                                 updated_at DATETIME NOT NULL,

                                 PRIMARY KEY (id),

                                 CONSTRAINT uk_vendor_payments_number
                                     UNIQUE (payment_number),

                                 CONSTRAINT fk_vendor_payments_vendor
                                     FOREIGN KEY (vendor_id)
                                         REFERENCES vendor_payments(id),

                                 INDEX idx_vendor_payments_vendor
                                     (vendor_id),

                                 INDEX idx_vendor_payments_date
                                     (payment_date)
);
INSERT INTO accounts
(
    account_code,
    account_name,
    account_type,
    active,
    description,
    created_at,
    updated_at
)
VALUES

    ('1000', 'Cash', 'ASSET', TRUE,
     'Cash in hand', NOW(), NOW()),

    ('1010', 'Bank', 'ASSET', TRUE,
     'Bank account', NOW(), NOW()),

    ('1020', 'UPI', 'ASSET', TRUE,
     'UPI and digital payments', NOW(), NOW()),

    ('1100', 'Accounts Receivable', 'ASSET', TRUE,
     'Customer outstanding balances', NOW(), NOW()),

    ('1200', 'Inventory', 'ASSET', TRUE,
     'Spare parts inventory', NOW(), NOW()),

    ('2000', 'Accounts Payable', 'LIABILITY', TRUE,
     'Vendor outstanding balances', NOW(), NOW()),

    ('4000', 'Service Revenue', 'REVENUE', TRUE,
     'Vehicle service revenue', NOW(), NOW()),

    ('4010', 'Parts Revenue', 'REVENUE', TRUE,
     'Spare parts sales revenue', NOW(), NOW()),

    ('5000', 'Electricity Expense', 'EXPENSE', TRUE,
     'Electricity expenses', NOW(), NOW()),

    ('5010', 'Salary Expense', 'EXPENSE', TRUE,
     'Employee salary expenses', NOW(), NOW()),

    ('5020', 'Rent Expense', 'EXPENSE', TRUE,
     'Garage rent expenses', NOW(), NOW()),

    ('5030', 'Tools Expense', 'EXPENSE', TRUE,
     'Workshop tools expenses', NOW(), NOW()),

    ('5040', 'Other Expense', 'EXPENSE', TRUE,
     'Other business expenses', NOW(), NOW());