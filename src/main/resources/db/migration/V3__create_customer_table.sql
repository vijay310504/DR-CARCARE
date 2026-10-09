CREATE TABLE IF NOT EXISTS customers  (
                           id BIGINT NOT NULL AUTO_INCREMENT,

                           customer_code VARCHAR(30) NOT NULL UNIQUE,

                           name VARCHAR(100) NOT NULL,

                           email VARCHAR(150) UNIQUE,

                           phone VARCHAR(20) NOT NULL,

                           alternate_phone VARCHAR(20),

                           address VARCHAR(255),

                           city VARCHAR(100),

                           state VARCHAR(100),

                           pincode VARCHAR(10),

                           notes VARCHAR(500),

                           is_active BOOLEAN NOT NULL DEFAULT TRUE,

                           created_at DATETIME NOT NULL,

                           updated_at DATETIME NOT NULL,

                           PRIMARY KEY (id)
);