-- ============================================
-- DR.CARCARE - AUTHENTICATION TABLES
-- Migration: V1
-- ============================================


-- ============================================
-- ROLES
-- ============================================
CREATE TABLE roles (
                       id BIGINT NOT NULL AUTO_INCREMENT,
                       name VARCHAR(50) NOT NULL,
                       description VARCHAR(255),
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                       PRIMARY KEY (id),
                       UNIQUE KEY uk_roles_name (name)
);


-- ============================================
-- PERMISSIONS
-- ============================================
CREATE TABLE permissions (
                             id BIGINT NOT NULL AUTO_INCREMENT,
                             name VARCHAR(100) NOT NULL,
                             description VARCHAR(255),
                             created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                             PRIMARY KEY (id),
                             UNIQUE KEY uk_permissions_name (name)
);


-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
                       id BIGINT NOT NULL AUTO_INCREMENT,
                       name VARCHAR(100) NOT NULL,
                       email VARCHAR(150) NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       phone VARCHAR(20),
                       is_active BOOLEAN NOT NULL DEFAULT TRUE,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,

                       PRIMARY KEY (id),
                       UNIQUE KEY uk_users_email (email)
);


-- ============================================
-- USER ↔ ROLE
-- ============================================
CREATE TABLE user_roles (
                            user_id BIGINT NOT NULL,
                            role_id BIGINT NOT NULL,

                            PRIMARY KEY (user_id, role_id),

                            CONSTRAINT fk_user_roles_user
                                FOREIGN KEY (user_id)
                                    REFERENCES users(id)
                                    ON DELETE CASCADE,

                            CONSTRAINT fk_user_roles_role
                                FOREIGN KEY (role_id)
                                    REFERENCES roles(id)
                                    ON DELETE CASCADE
);


-- ============================================
-- ROLE ↔ PERMISSION
-- ============================================
CREATE TABLE role_permissions (
                                  role_id BIGINT NOT NULL,
                                  permission_id BIGINT NOT NULL,

                                  PRIMARY KEY (role_id, permission_id),

                                  CONSTRAINT fk_role_permissions_role
                                      FOREIGN KEY (role_id)
                                          REFERENCES roles(id)
                                          ON DELETE CASCADE,

                                  CONSTRAINT fk_role_permissions_permission
                                      FOREIGN KEY (permission_id)
                                          REFERENCES permissions(id)
                                          ON DELETE CASCADE
);


-- ============================================
-- DEFAULT ROLES
-- ============================================
INSERT INTO roles (name, description) VALUES
                                          ('ADMIN', 'Full access to the entire DR.CARCARE system'),
                                          ('MANAGER', 'Manages garage operations and workshop activities'),
                                          ('ACCOUNTANT', 'Manages billing, payments, expenses and accounting'),
                                          ('TECHNICIAN', 'Handles assigned vehicle services and technical work');


-- ============================================
-- DEFAULT PERMISSIONS
-- ============================================
INSERT INTO permissions (name, description) VALUES
                                                ('CUSTOMER_VIEW', 'View customers'),
                                                ('CUSTOMER_CREATE', 'Create customers'),
                                                ('CUSTOMER_EDIT', 'Edit customers'),
                                                ('CUSTOMER_DELETE', 'Delete customers'),

                                                ('VEHICLE_VIEW', 'View vehicles'),
                                                ('VEHICLE_CREATE', 'Create vehicles'),
                                                ('VEHICLE_EDIT', 'Edit vehicles'),
                                                ('VEHICLE_DELETE', 'Delete vehicles'),

                                                ('BOOKING_VIEW', 'View service bookings'),
                                                ('BOOKING_CREATE', 'Create service bookings'),
                                                ('BOOKING_EDIT', 'Edit service bookings'),
                                                ('BOOKING_DELETE', 'Delete service bookings'),

                                                ('JOB_CARD_VIEW', 'View job cards'),
                                                ('JOB_CARD_CREATE', 'Create job cards'),
                                                ('JOB_CARD_EDIT', 'Edit job cards'),

                                                ('INVENTORY_VIEW', 'View inventory'),
                                                ('INVENTORY_CREATE', 'Add inventory'),
                                                ('INVENTORY_EDIT', 'Edit inventory'),

                                                ('INVOICE_VIEW', 'View invoices'),
                                                ('INVOICE_CREATE', 'Create invoices'),
                                                ('INVOICE_EDIT', 'Edit invoices'),

                                                ('PAYMENT_VIEW', 'View payments'),
                                                ('PAYMENT_CREATE', 'Record payments'),

                                                ('EXPENSE_VIEW', 'View expenses'),
                                                ('EXPENSE_CREATE', 'Record expenses'),

                                                ('REPORT_VIEW', 'View reports'),

                                                ('USER_VIEW', 'View users'),
                                                ('USER_CREATE', 'Create users'),
                                                ('USER_EDIT', 'Edit users'),
                                                ('USER_DELETE', 'Delete users');


-- ============================================
-- ADMIN GETS ALL PERMISSIONS
-- ============================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM roles r
         CROSS JOIN permissions p
WHERE r.name = 'ADMIN';


-- ============================================
-- MANAGER PERMISSIONS
-- ============================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM roles r
         JOIN permissions p
WHERE r.name = 'MANAGER'
  AND p.name IN (
                 'CUSTOMER_VIEW',
                 'CUSTOMER_CREATE',
                 'CUSTOMER_EDIT',
                 'VEHICLE_VIEW',
                 'VEHICLE_CREATE',
                 'VEHICLE_EDIT',
                 'BOOKING_VIEW',
                 'BOOKING_CREATE',
                 'BOOKING_EDIT',
                 'JOB_CARD_VIEW',
                 'JOB_CARD_CREATE',
                 'JOB_CARD_EDIT',
                 'INVENTORY_VIEW',
                 'INVENTORY_CREATE',
                 'INVENTORY_EDIT',
                 'INVOICE_VIEW',
                 'INVOICE_CREATE',
                 'PAYMENT_VIEW',
                 'REPORT_VIEW'
    );


-- ============================================
-- ACCOUNTANT PERMISSIONS
-- ============================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM roles r
         JOIN permissions p
WHERE r.name = 'ACCOUNTANT'
  AND p.name IN (
                 'CUSTOMER_VIEW',
                 'VEHICLE_VIEW',
                 'INVOICE_VIEW',
                 'INVOICE_CREATE',
                 'INVOICE_EDIT',
                 'PAYMENT_VIEW',
                 'PAYMENT_CREATE',
                 'EXPENSE_VIEW',
                 'EXPENSE_CREATE',
                 'REPORT_VIEW'
    );


-- ============================================
-- TECHNICIAN PERMISSIONS
-- ============================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM roles r
         JOIN permissions p
WHERE r.name = 'TECHNICIAN'
  AND p.name IN (
                 'CUSTOMER_VIEW',
                 'VEHICLE_VIEW',
                 'JOB_CARD_VIEW',
                 'JOB_CARD_EDIT',
                 'INVENTORY_VIEW'
    );