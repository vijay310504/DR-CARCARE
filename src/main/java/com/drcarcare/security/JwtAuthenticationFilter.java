package com.drcarcare.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(
                    JwtAuthenticationFilter.class
            );

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        /*
         * No Authorization header.
         *
         * Continue normally. Spring Security will decide
         * whether the endpoint requires authentication.
         */
        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        String token =
                authHeader.substring(7).trim();

        /*
         * Empty Bearer token.
         */
        if (token.isBlank()) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        try {

            /*
             * Extract username/email from JWT.
             */
            String email =
                    jwtService.extractUsername(token);

            /*
             * Only authenticate if SecurityContext does not
             * already contain an authenticated user.
             */
            if (email != null
                    && SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                /*
                 * Load user together with roles and permissions.
                 */
                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(email);

                /*
                 * Validate token against loaded user.
                 */
                if (jwtService.isTokenValid(
                        token,
                        userDetails
                )) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );
                }
            }

        } catch (Exception exception) {

            /*
             * Never expose JWT parsing details to the client.
             *
             * The request continues without authentication.
             * If the endpoint is protected, Spring Security will
             * subsequently return 401/403 as appropriate.
             */
            SecurityContextHolder
                    .clearContext();

            log.debug(
                    "JWT authentication failed for request {} {}: {}",
                    request.getMethod(),
                    request.getRequestURI(),
                    exception.getMessage()
            );
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}