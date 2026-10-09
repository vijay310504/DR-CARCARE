CREATE TABLE IF NOT EXISTS service_catalogue (
                                                 id BIGINT NOT NULL AUTO_INCREMENT,

                                                 service_code VARCHAR(30) NOT NULL,

                                                 service_name VARCHAR(150) NOT NULL,

                                                 category VARCHAR(100),

                                                 description VARCHAR(500),

                                                 standard_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,

                                                 estimated_hours DECIMAL(6,2),

                                                 active BOOLEAN NOT NULL DEFAULT TRUE,

                                                 created_at DATETIME NOT NULL,

                                                 updated_at DATETIME NOT NULL,

                                                 PRIMARY KEY (id),

                                                 CONSTRAINT uk_service_code
                                                     UNIQUE (service_code)
);
CREATE TABLE IF NOT EXISTS job_card_services (
                                                 id BIGINT NOT NULL AUTO_INCREMENT,

                                                 job_card_id BIGINT NOT NULL,

                                                 service_id BIGINT NOT NULL,

                                                 technician_id BIGINT,

                                                 description VARCHAR(255),

                                                 quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,

                                                 unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,

                                                 discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

                                                 tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,

                                                 tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

                                                 total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

                                                 status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

                                                 started_at DATETIME,

                                                 completed_at DATETIME,

                                                 notes VARCHAR(500),

                                                 created_at DATETIME NOT NULL,

                                                 updated_at DATETIME NOT NULL,

                                                 PRIMARY KEY (id),

                                                 CONSTRAINT fk_job_card_service_job_card
                                                     FOREIGN KEY (job_card_id)
                                                         REFERENCES job_cards(id)
                                                         ON DELETE CASCADE,

                                                 CONSTRAINT fk_job_card_service_service
                                                     FOREIGN KEY (service_id)
                                                         REFERENCES service_catalogue(id),

                                                 CONSTRAINT fk_job_card_service_technician
                                                     FOREIGN KEY (technician_id)
                                                         REFERENCES technicians(id)
);