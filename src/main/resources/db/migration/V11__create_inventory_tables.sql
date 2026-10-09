CREATE TABLE IF NOT EXISTS inventory_items (
                                               id BIGINT NOT NULL AUTO_INCREMENT,
                                               part_code VARCHAR(50) NOT NULL,
                                               part_name VARCHAR(150) NOT NULL,
                                               category VARCHAR(100),
                                               brand VARCHAR(100),
                                               unit VARCHAR(30) NOT NULL DEFAULT 'PCS',
                                               description VARCHAR(500),
                                               purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                                               selling_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                                               current_stock DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                                               minimum_stock DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                                               maximum_stock DECIMAL(12,2),
                                               active BOOLEAN NOT NULL DEFAULT TRUE,
                                               created_at DATETIME NOT NULL,
                                               updated_at DATETIME NOT NULL,

                                               PRIMARY KEY (id),

                                               CONSTRAINT uk_inventory_part_code
                                                   UNIQUE (part_code)
);


CREATE TABLE IF NOT EXISTS inventory_transactions (
                                                      id BIGINT NOT NULL AUTO_INCREMENT,
                                                      inventory_item_id BIGINT NOT NULL,
                                                      transaction_type VARCHAR(30) NOT NULL,
                                                      quantity DECIMAL(12,2) NOT NULL,
                                                      stock_before DECIMAL(12,2) NOT NULL,
                                                      stock_after DECIMAL(12,2) NOT NULL,
                                                      reference_type VARCHAR(50),
                                                      reference_id BIGINT,
                                                      notes VARCHAR(500),
                                                      transaction_date DATETIME NOT NULL,
                                                      created_at DATETIME NOT NULL,

                                                      PRIMARY KEY (id),

                                                      CONSTRAINT fk_inventory_transaction_item
                                                          FOREIGN KEY (inventory_item_id)
                                                              REFERENCES inventory_items(id)
);


CREATE TABLE IF NOT EXISTS job_card_parts (
                                              id BIGINT NOT NULL AUTO_INCREMENT,
                                              job_card_id BIGINT NOT NULL,
                                              inventory_item_id BIGINT NOT NULL,
                                              quantity DECIMAL(12,2) NOT NULL,
                                              unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                                              total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                                              status VARCHAR(30) NOT NULL DEFAULT 'USED',
                                              notes VARCHAR(500),
                                              created_at DATETIME NOT NULL,
                                              updated_at DATETIME NOT NULL,

                                              PRIMARY KEY (id),

                                              CONSTRAINT fk_job_card_part_job_card
                                                  FOREIGN KEY (job_card_id)
                                                      REFERENCES job_cards(id)
                                                      ON DELETE CASCADE,

                                              CONSTRAINT fk_job_card_part_inventory_item
                                                  FOREIGN KEY (inventory_item_id)
                                                      REFERENCES inventory_items(id)
);