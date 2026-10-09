package com.drcarcare.security;

import com.drcarcare.entity.Permission;
import com.drcarcare.entity.Role;
import com.drcarcare.entity.User;
import com.drcarcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Loads user authentication information.
     *
     * UserRepository uses EntityGraph to load:
     *
     * User
     *   └── Roles
     *        └── Permissions
     *
     * The transaction also protects this method from lazy-loading
     * problems if another relationship is accessed in the future.
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(
            String email
    ) throws UsernameNotFoundException {

        if (email == null || email.isBlank()) {
            throw new UsernameNotFoundException(
                    "Email is required"
            );
        }

        String normalizedEmail =
                email.trim();

        User user =
                userRepository.findByEmail(
                        normalizedEmail
                ).orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found: "
                                        + normalizedEmail
                        )
                );

        Set<SimpleGrantedAuthority> authorities =
                new LinkedHashSet<>();

        /*
         * Load role and permission authorities.
         */
        for (Role role : user.getRoles()) {

            if (role == null
                    || role.getName() == null
                    || role.getName().isBlank()) {
                continue;
            }

            String roleName =
                    role.getName()
                            .trim()
                            .toUpperCase();

            /*
             * Prevent ROLE_ROLE_ADMIN if the database already
             * contains ROLE_ADMIN.
             */
            String roleAuthority =
                    roleName.startsWith("ROLE_")
                            ? roleName
                            : "ROLE_" + roleName;

            authorities.add(
                    new SimpleGrantedAuthority(
                            roleAuthority
                    )
            );

            /*
             * Add permissions.
             */
            for (Permission permission :
                    role.getPermissions()) {

                if (permission == null
                        || permission.getName() == null
                        || permission.getName().isBlank()) {
                    continue;
                }

                authorities.add(
                        new SimpleGrantedAuthority(
                                permission.getName()
                                        .trim()
                        )
                );
            }
        }

        /*
         * Spring Security UserDetails.
         */
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(authorities)
                .disabled(!Boolean.TRUE.equals(
                        user.getActive()
                ))
                .build();
    }
}