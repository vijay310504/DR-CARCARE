CREATE TABLE IF NOT EXISTS technicians (
                                           id BIGINT NOT NULL AUTO_INCREMENT,

                                           technician_code VARCHAR(30) NOT NULL,

                                           name VARCHAR(100) NOT NULL,

                                           phone VARCHAR(20),

                                           email VARCHAR(100),

                                           specialization VARCHAR(100),

                                           experience_years INT,

                                           skill_level VARCHAR(30),

                                           status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

                                           joining_date DATE,

                                           address VARCHAR(500),

                                           notes VARCHAR(500),

                                           created_at DATETIME NOT NULL,

                                           updated_at DATETIME NOT NULL,

                                           PRIMARY KEY (id),

                                           CONSTRAINT uk_technician_code
                                               UNIQUE (technician_code),

                                           CONSTRAINT uk_technician_email
                                               UNIQUE (email)
);
CREATE TABLE IF NOT EXISTS job_card_technicians (
                                                    id BIGINT NOT NULL AUTO_INCREMENT,

                                                    job_card_id BIGINT NOT NULL,

                                                    technician_id BIGINT NOT NULL,

                                                    assigned_at DATETIME NOT NULL,

                                                    started_at DATETIME,

                                                    completed_at DATETIME,

                                                    status VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED',

                                                    estimated_hours DECIMAL(6,2),

                                                    actual_hours DECIMAL(6,2),

                                                    notes VARCHAR(500),

                                                    created_at DATETIME NOT NULL,

                                                    updated_at DATETIME NOT NULL,

                                                    PRIMARY KEY (id),

                                                    CONSTRAINT fk_job_card_technician_job_card
                                                        FOREIGN KEY (job_card_id)
                                                            REFERENCES job_cards(id)
                                                            ON DELETE CASCADE,

                                                    CONSTRAINT fk_job_card_technician_technician
                                                        FOREIGN KEY (technician_id)
                                                            REFERENCES technicians(id)
);