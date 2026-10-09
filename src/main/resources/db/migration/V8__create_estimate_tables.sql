CREATE TABLE IF NOT EXISTS estimates (
                                         id BIGINT NOT NULL AUTO_INCREMENT,

                                         estimate_number VARCHAR(30) NOT NULL,

                                         job_card_id BIGINT NOT NULL,

                                         estimate_date DATE NOT NULL,

                                         valid_until DATE,

                                         status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

                                         subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,

                                         discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

                                         tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

                                         total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

                                         customer_notes VARCHAR(500),

                                         internal_notes VARCHAR(500),

                                         rejection_reason VARCHAR(500),

                                         approved_at DATETIME,

                                         rejected_at DATETIME,

                                         created_at DATETIME NOT NULL,

                                         updated_at DATETIME NOT NULL,

                                         PRIMARY KEY (id),

                                         CONSTRAINT uk_estimate_number
                                             UNIQUE (estimate_number),

                                         CONSTRAINT fk_estimate_job_card
                                             FOREIGN KEY (job_card_id)
                                                 REFERENCES job_cards(id)
);
CREATE TABLE IF NOT EXISTS estimate_items (
                                              id BIGINT NOT NULL AUTO_INCREMENT,

                                              estimate_id BIGINT NOT NULL,

                                              item_type VARCHAR(30) NOT NULL,

                                              description VARCHAR(255) NOT NULL,

                                              quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,

                                              unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,

                                              discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

                                              tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,

                                              tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

                                              total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

                                              notes VARCHAR(500),

                                              created_at DATETIME NOT NULL,

                                              updated_at DATETIME NOT NULL,

                                              PRIMARY KEY (id),

                                              CONSTRAINT fk_estimate_item_estimate
                                                  FOREIGN KEY (estimate_id)
                                                      REFERENCES estimates(id)
                                                      ON DELETE CASCADE
);