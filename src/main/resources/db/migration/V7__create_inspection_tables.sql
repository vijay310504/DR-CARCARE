CREATE TABLE IF NOT EXISTS inspections (
                                           id BIGINT NOT NULL AUTO_INCREMENT,

                                           job_card_id BIGINT NOT NULL,

                                           inspection_category VARCHAR(50) NOT NULL,

                                           inspection_item VARCHAR(100) NOT NULL,

                                           condition_status VARCHAR(30) NOT NULL,

                                           remarks VARCHAR(500),

                                           created_at DATETIME NOT NULL,
                                           updated_at DATETIME NOT NULL,

                                           PRIMARY KEY (id),

                                           CONSTRAINT fk_inspection_job_card
                                               FOREIGN KEY (job_card_id)
                                                   REFERENCES job_cards(id)
);