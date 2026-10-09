CREATE TABLE expenses (
                          id BIGINT NOT NULL AUTO_INCREMENT,

                          expense_number VARCHAR(30) NOT NULL,

                          expense_date DATE NOT NULL,

                          category VARCHAR(50) NOT NULL,

                          description VARCHAR(500) NOT NULL,

                          amount DECIMAL(15,2) NOT NULL,

                          payment_method VARCHAR(30) NOT NULL,

                          reference_number VARCHAR(100),

                          notes VARCHAR(1000),

                          created_at DATETIME NOT NULL,

                          updated_at DATETIME NOT NULL,

                          PRIMARY KEY (id),

                          CONSTRAINT uk_expenses_expense_number
                              UNIQUE (expense_number),

                          INDEX idx_expenses_date (expense_date),

                          INDEX idx_expenses_category (category),

                          INDEX idx_expenses_payment_method (payment_method)
);


CREATE TABLE day_book_entries (
                                  id BIGINT NOT NULL AUTO_INCREMENT,

                                  entry_number VARCHAR(30) NOT NULL,

                                  entry_date DATE NOT NULL,

                                  entry_type VARCHAR(30) NOT NULL,

                                  reference_type VARCHAR(30),

                                  reference_id BIGINT,

                                  description VARCHAR(500) NOT NULL,

                                  debit_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                                  credit_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                                  payment_method VARCHAR(30),

                                  created_at DATETIME NOT NULL,

                                  updated_at DATETIME NOT NULL,

                                  PRIMARY KEY (id),

                                  CONSTRAINT uk_day_book_entry_number
                                      UNIQUE (entry_number),

                                  INDEX idx_day_book_date (entry_date),

                                  INDEX idx_day_book_type (entry_type),

                                  INDEX idx_day_book_reference (
                                                                reference_type,
                                                                reference_id
                                      )
);