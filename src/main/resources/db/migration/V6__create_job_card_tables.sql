CREATE TABLE IF NOT EXISTS job_cards (

                                         id BIGINT NOT NULL AUTO_INCREMENT,

                                         job_card_number VARCHAR(30) NOT NULL,

                                         booking_id BIGINT NOT NULL,

                                         customer_id BIGINT NOT NULL,

                                         vehicle_id BIGINT NOT NULL,

                                         opening_mileage INT,

                                         fuel_level VARCHAR(30),

                                         customer_complaint VARCHAR(500),

                                         advisor_notes VARCHAR(500),

                                         status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',

                                         opened_at DATETIME NOT NULL,

                                         updated_at DATETIME NOT NULL,

                                         closed_at DATETIME,

                                         PRIMARY KEY (id),

                                         CONSTRAINT uk_job_card_number
                                             UNIQUE (job_card_number),

                                         CONSTRAINT uk_job_card_booking
                                             UNIQUE (booking_id),

                                         CONSTRAINT fk_job_card_booking
                                             FOREIGN KEY (booking_id)
                                                 REFERENCES bookings(id),

                                         CONSTRAINT fk_job_card_customer
                                             FOREIGN KEY (customer_id)
                                                 REFERENCES customers(id),

                                         CONSTRAINT fk_job_card_vehicle
                                             FOREIGN KEY (vehicle_id)
                                                 REFERENCES vehicles(id)

);