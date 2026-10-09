INSERT IGNORE INTO roles (name, description, created_at)
VALUES
    ('ADMIN', 'Full access to the entire DR.CARCARE system', NOW()),
    ('MANAGER', 'Manages garage operations and workshop activities', NOW()),
    ('ACCOUNTANT', 'Manages billing, payments, expenses and accounting', NOW()),
    ('TECHNICIAN', 'Handles assigned vehicle services and technical work', NOW());
