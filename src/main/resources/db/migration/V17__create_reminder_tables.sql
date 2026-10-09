CREATE TABLE IF NOT EXISTS reminders (

                                         id BIGINT NOT NULL AUTO_INCREMENT,

                                         customer_id BIGINT NOT NULL,

                                         vehicle_id BIGINT,

                                         reminder_type VARCHAR(40) NOT NULL,

                                         title VARCHAR(200) NOT NULL,

                                         description VARCHAR(500),

                                         due_date DATE NOT NULL,

                                         status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

                                         priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',

                                         completed_at DATETIME,

                                         notes VARCHAR(1000),

                                         created_at DATETIME NOT NULL,

                                         updated_at DATETIME NOT NULL,

                                         PRIMARY KEY (id),

                                         CONSTRAINT fk_reminder_customer
                                             FOREIGN KEY (customer_id)
                                                 REFERENCES customers(id),

                                         CONSTRAINT fk_reminder_vehicle
                                             FOREIGN KEY (vehicle_id)
                                                 REFERENCES vehicles(id),

                                         INDEX idx_reminders_customer (customer_id),

                                         INDEX idx_reminders_vehicle (vehicle_id),

                                         INDEX idx_reminders_due_date (due_date),

                                         INDEX idx_reminders_status (status),

                                         INDEX idx_reminders_type (reminder_type)

);