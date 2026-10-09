-- =========================================================
-- DR.CARCARE
-- V13 - Billing, Invoicing & Payment Management
-- =========================================================

CREATE TABLE invoices (
                          id BIGINT NOT NULL AUTO_INCREMENT,

                          invoice_number VARCHAR(30) NOT NULL,

                          job_card_id BIGINT NOT NULL,

                          invoice_date DATE NOT NULL,

                          status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

                          subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                          discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                          tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                          total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                          paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                          outstanding_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                          notes VARCHAR(1000),

                          created_at DATETIME NOT NULL,

                          updated_at DATETIME NOT NULL,

                          PRIMARY KEY (id),

                          CONSTRAINT uk_invoices_invoice_number
                              UNIQUE (invoice_number),

                          INDEX idx_invoices_job_card (job_card_id),
                          INDEX idx_invoices_status (status),
                          INDEX idx_invoices_date (invoice_date)
);


-- =========================================================
-- INVOICE ITEMS
-- =========================================================

CREATE TABLE invoice_items (
                               id BIGINT NOT NULL AUTO_INCREMENT,

                               invoice_id BIGINT NOT NULL,

                               item_type VARCHAR(20) NOT NULL,

                               source_id BIGINT,

                               description VARCHAR(500) NOT NULL,

                               quantity DECIMAL(15,3) NOT NULL DEFAULT 1.000,

                               unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                               discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                               tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,

                               tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                               total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                               created_at DATETIME NOT NULL,

                               updated_at DATETIME NOT NULL,

                               PRIMARY KEY (id),

                               CONSTRAINT fk_invoice_items_invoice
                                   FOREIGN KEY (invoice_id)
                                       REFERENCES invoices(id),

                               INDEX idx_invoice_items_invoice (invoice_id),
                               INDEX idx_invoice_items_type (item_type),
                               INDEX idx_invoice_items_source (source_id)
);


-- =========================================================
-- PAYMENTS
-- =========================================================

CREATE TABLE payments (
                          id BIGINT NOT NULL AUTO_INCREMENT,

                          payment_number VARCHAR(30) NOT NULL,

                          invoice_id BIGINT NOT NULL,

                          payment_date DATE NOT NULL,

                          amount DECIMAL(15,2) NOT NULL,

                          payment_method VARCHAR(30) NOT NULL,

                          reference_number VARCHAR(100),

                          notes VARCHAR(1000),

                          created_at DATETIME NOT NULL,

                          updated_at DATETIME NOT NULL,

                          PRIMARY KEY (id),

                          CONSTRAINT uk_payments_payment_number
                              UNIQUE (payment_number),

                          CONSTRAINT fk_payments_invoice
                              FOREIGN KEY (invoice_id)
                                  REFERENCES invoices(id),

                          INDEX idx_payments_invoice (invoice_id),
                          INDEX idx_payments_date (payment_date),
                          INDEX idx_payments_method (payment_method)
);