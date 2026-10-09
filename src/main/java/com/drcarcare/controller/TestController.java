package com.drcarcare.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/public")
    public String publicTest() {
        return "Public API is working";
    }

    @GetMapping("/secure")
    public String secureTest(Authentication authentication) {
        return "Secure API is working. Logged in as: "
                + authentication.getName();
    }
    @GetMapping("/protected")
    public String protectedTest() {
        return "Protected API is working";
    }
}