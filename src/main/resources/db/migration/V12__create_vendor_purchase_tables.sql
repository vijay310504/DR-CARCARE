-- =========================================================
-- DR.CARCARE
-- V12 - Vendor Management + Purchase Management
-- =========================================================

-- =========================================================
-- VENDORS
-- =========================================================

CREATE TABLE vendors (
                         id BIGINT NOT NULL AUTO_INCREMENT,

                         vendor_code VARCHAR(30) NOT NULL,
                         vendor_name VARCHAR(150) NOT NULL,

                         contact_person VARCHAR(100),

                         phone VARCHAR(20),
                         email VARCHAR(150),

                         address VARCHAR(500),
                         city VARCHAR(100),
                         state VARCHAR(100),
                         pincode VARCHAR(10),

                         gstin VARCHAR(30),
                         category VARCHAR(100),
                         payment_terms VARCHAR(100),

                         status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

                         notes VARCHAR(1000),

                         created_at DATETIME NOT NULL,
                         updated_at DATETIME NOT NULL,

                         PRIMARY KEY (id),

                         CONSTRAINT uk_vendors_vendor_code
                             UNIQUE (vendor_code),

                         INDEX idx_vendors_name (vendor_name),
                         INDEX idx_vendors_phone (phone),
                         INDEX idx_vendors_status (status)
);


-- =========================================================
-- PURCHASE ORDERS
-- =========================================================

CREATE TABLE purchase_orders (
                                 id BIGINT NOT NULL AUTO_INCREMENT,

                                 purchase_number VARCHAR(30) NOT NULL,

                                 vendor_id BIGINT NOT NULL,

                                 purchase_date DATE NOT NULL,
                                 expected_date DATE,

                                 status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

                                 subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
                                 discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
                                 tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
                                 total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                                 paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
                                 outstanding_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                                 invoice_number VARCHAR(100),
                                 invoice_date DATE,

                                 notes VARCHAR(1000),

                                 created_at DATETIME NOT NULL,
                                 updated_at DATETIME NOT NULL,

                                 PRIMARY KEY (id),

                                 CONSTRAINT uk_purchase_orders_number
                                     UNIQUE (purchase_number),

                                 CONSTRAINT fk_purchase_orders_vendor
                                     FOREIGN KEY (vendor_id)
                                         REFERENCES vendors(id),

                                 INDEX idx_purchase_orders_vendor (vendor_id),
                                 INDEX idx_purchase_orders_status (status),
                                 INDEX idx_purchase_orders_date (purchase_date)
);


-- =========================================================
-- PURCHASE ITEMS
-- =========================================================

CREATE TABLE purchase_items (
                                id BIGINT NOT NULL AUTO_INCREMENT,

                                purchase_order_id BIGINT NOT NULL,

    -- References the existing inventory_items.id
    -- Application/JPA layer handles this relationship.
                                inventory_item_id BIGINT NOT NULL,

                                quantity DECIMAL(15,3) NOT NULL,
                                received_quantity DECIMAL(15,3) NOT NULL DEFAULT 0.000,

                                unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                                discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                                tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                                tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                                total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                                created_at DATETIME NOT NULL,
                                updated_at DATETIME NOT NULL,

                                PRIMARY KEY (id),

                                CONSTRAINT fk_purchase_items_purchase
                                    FOREIGN KEY (purchase_order_id)
                                        REFERENCES purchase_orders(id),

                                INDEX idx_purchase_items_purchase
                                    (purchase_order_id),

                                INDEX idx_purchase_items_inventory
                                    (inventory_item_id)
);