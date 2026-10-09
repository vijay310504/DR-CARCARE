package com.drcarcare.service;

import com.drcarcare.dto.LoginRequest;
import com.drcarcare.dto.LoginResponse;
import com.drcarcare.dto.RegisterRequest;
import com.drcarcare.entity.Role;
import com.drcarcare.entity.User;
import com.drcarcare.repository.RoleRepository;
import com.drcarcare.repository.UserRepository;
import com.drcarcare.security.CustomUserDetailsService;
import com.drcarcare.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public LoginResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "User already exists with email: "
                            + request.getEmail()
            );
        }

        Role defaultRole = roleRepository.findByName("MANAGER")
                .orElseThrow(() ->
                        new RuntimeException(
                                "Default role MANAGER not found"
                        )
                );

        LocalDateTime now = LocalDateTime.now();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .phone(request.getPhone())
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        user.getRoles().add(defaultRole);

        User savedUser = userRepository.save(user);

        /*
         * Load the user through CustomUserDetailsService
         * so the JWT contains both:
         *
         * ROLE_MANAGER
         * CUSTOMER_CREATE
         * CUSTOMER_VIEW
         * CUSTOMER_EDIT
         * VEHICLE_CREATE
         * etc.
         */
        UserDetails userDetails =
                userDetailsService.loadUserByUsername(
                        savedUser.getEmail()
                );

        String token = jwtService.generateToken(userDetails);

        return buildLoginResponse(savedUser, token);
    }

    public LoginResponse login(LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );

        UserDetails userDetails =
                (UserDetails) authentication.getPrincipal();

        String token =
                jwtService.generateToken(userDetails);

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        return buildLoginResponse(user, token);
    }

    private LoginResponse buildLoginResponse(
            User user,
            String token
    ) {

        Set<String> roles = user.getRoles()
                .stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(roles)
                .build();
    }
}