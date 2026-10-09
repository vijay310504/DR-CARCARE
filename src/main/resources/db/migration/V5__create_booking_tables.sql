CREATE TABLE IF NOT EXISTS bookings (

                                        id BIGINT NOT NULL AUTO_INCREMENT,

                                        booking_code VARCHAR(30) NOT NULL,

                                        customer_id BIGINT NOT NULL,

                                        vehicle_id BIGINT NOT NULL,

                                        booking_date DATE NOT NULL,

                                        expected_arrival_time TIME,

                                        service_type VARCHAR(100) NOT NULL,

                                        customer_complaint VARCHAR(500),

                                        status VARCHAR(30) NOT NULL DEFAULT 'BOOKED',

                                        notes VARCHAR(500),

                                        created_at DATETIME NOT NULL,

                                        updated_at DATETIME NOT NULL,

                                        PRIMARY KEY (id),

                                        CONSTRAINT uk_booking_code
                                            UNIQUE (booking_code),

                                        CONSTRAINT fk_booking_customer
                                            FOREIGN KEY (customer_id)
                                                REFERENCES customers(id),

                                        CONSTRAINT fk_booking_vehicle
                                            FOREIGN KEY (vehicle_id)
                                                REFERENCES vehicles(id)

);