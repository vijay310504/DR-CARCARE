CREATE TABLE IF NOT EXISTS vehicles (
                                        id BIGINT NOT NULL AUTO_INCREMENT,

                                        vehicle_number VARCHAR(20) NOT NULL,
                                        make VARCHAR(100) NOT NULL,
                                        model VARCHAR(100) NOT NULL,
                                        variant VARCHAR(100),

                                        manufacturing_year INT,

                                        color VARCHAR(50),
                                        fuel_type VARCHAR(30),

                                        vin VARCHAR(100),
                                        engine_number VARCHAR(100),

                                        current_mileage INT,

                                        customer_id BIGINT NOT NULL,

                                        is_active BOOLEAN NOT NULL DEFAULT TRUE,

                                        created_at DATETIME NOT NULL,
                                        updated_at DATETIME NOT NULL,

                                        PRIMARY KEY (id),

                                        CONSTRAINT uk_vehicle_number
                                            UNIQUE (vehicle_number),

                                        CONSTRAINT fk_vehicle_customer
                                            FOREIGN KEY (customer_id)
                                                REFERENCES customers(id)
);