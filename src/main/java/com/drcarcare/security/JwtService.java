package com.drcarcare.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration
    ) {

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT secret is not configured"
            );
        }

        byte[] secretBytes =
                secret.getBytes(StandardCharsets.UTF_8);

        /*
         * HS256 requires a sufficiently long secret key.
         * 32 bytes is a safe minimum for this application.
         */
        if (secretBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret must contain at least 32 UTF-8 bytes"
            );
        }

        if (expiration <= 0) {
            throw new IllegalStateException(
                    "JWT expiration must be greater than zero"
            );
        }

        this.secretKey =
                Keys.hmacShaKeyFor(secretBytes);

        this.expiration = expiration;
    }

    /**
     * Generates JWT token for authenticated user.
     */
    public String generateToken(
            UserDetails userDetails
    ) {

        List<String> authorities =
                userDetails.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .distinct()
                        .toList();

        Date now = new Date();

        Date expiryDate =
                new Date(
                        now.getTime() + expiration
                );

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim(
                        "authorities",
                        authorities
                )
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    /**
     * Extracts username/email from JWT.
     */
    public String extractUsername(
            String token
    ) {

        return extractAllClaims(token)
                .getSubject();
    }

    /**
     * Validates JWT against the currently loaded user.
     */
    public boolean isTokenValid(
            String token,
            UserDetails userDetails
    ) {

        String username =
                extractUsername(token);

        return username != null
                && username.equals(
                userDetails.getUsername()
        )
                && !isTokenExpired(token);
    }

    /**
     * Checks whether JWT has expired.
     */
    private boolean isTokenExpired(
            String token
    ) {

        Date expirationDate =
                extractAllClaims(token)
                        .getExpiration();

        return expirationDate == null
                || expirationDate.before(
                new Date()
        );
    }

    /**
     * Parses and verifies signed JWT claims.
     *
     * Signature verification is performed using the
     * configured secret key.
     */
    private Claims extractAllClaims(
            String token
    ) {

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException(
                    "JWT token is empty"
            );
        }

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}