CREATE TABLE audit_logs (

                            id BIGINT NOT NULL AUTO_INCREMENT,

                            user_id BIGINT,

                            username VARCHAR(150),

                            action VARCHAR(60) NOT NULL,

                            entity_type VARCHAR(60),

                            entity_id BIGINT,

                            description VARCHAR(1000) NOT NULL,

                            old_values TEXT,

                            new_values TEXT,

                            ip_address VARCHAR(100),

                            created_at DATETIME NOT NULL,

                            PRIMARY KEY (id),

                            INDEX idx_audit_logs_user_id (user_id),

                            INDEX idx_audit_logs_username (username),

                            INDEX idx_audit_logs_action (action),

                            INDEX idx_audit_logs_entity (
                                                         entity_type,
                                                         entity_id
                                ),

                            INDEX idx_audit_logs_created_at (created_at)

);