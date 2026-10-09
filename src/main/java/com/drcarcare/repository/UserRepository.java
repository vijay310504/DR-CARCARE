package com.drcarcare.repository;

import com.drcarcare.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    /**
     * Loads the complete authorization graph needed by Spring Security:
     *
     * User
     *   └── Roles
     *        └── Permissions
     *
     * This prevents lazy-loading problems while building
     * UserDetails during authentication/JWT validation.
     */
    @EntityGraph(
            attributePaths = {
                    "roles",
                    "roles.permissions"
            }
    )
    Optional<User> findByEmail(
            String email
    );

    boolean existsByEmail(
            String email
    );
}