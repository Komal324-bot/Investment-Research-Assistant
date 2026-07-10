package com.project.investment_agent.controller;

import com.project.investment_agent.dto.LoginRequest;
import com.project.investment_agent.dto.LoginResponse;
import com.project.investment_agent.dto.RegisterRequest;
import com.project.investment_agent.entity.User;
import com.project.investment_agent.repository.UserRepository;
import com.project.investment_agent.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")

public class AuthController {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private JwtUtil jwtUtil;

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody LoginRequest request) {

                User user = userRepository
                                .findByUsername(request.getUsername())
                                .orElse(null);

                if (user == null) {
                        return ResponseEntity
                                        .status(HttpStatus.UNAUTHORIZED)
                                        .body("User Not Found");
                }

                if (!passwordEncoder.matches(
                                request.getPassword(),
                                user.getPassword())) {

                        return ResponseEntity
                                        .status(HttpStatus.UNAUTHORIZED)
                                        .body("Invalid Password");
                }

                String token = jwtUtil.generateToken(user.getUsername());

                return ResponseEntity.ok(
                                new LoginResponse(
                                                token,
                                                "Login Successful"));
        }

        @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

                String username = request.getUsername() == null
                                ? null
                                : request.getUsername().trim();

                String password = request.getPassword();

                if (username == null || username.isEmpty()) {
                        return ResponseEntity
                                        .status(HttpStatus.BAD_REQUEST)
                                        .body("Username is required");
                }

                if (username.length() < 3) {
                        return ResponseEntity
                                        .status(HttpStatus.BAD_REQUEST)
                                        .body("Username must be at least 3 characters");
                }

                if (password == null || password.length() < 6) {
                        return ResponseEntity
                                        .status(HttpStatus.BAD_REQUEST)
                                        .body("Password must be at least 6 characters");
                }

                if (userRepository.existsByUsername(username)) {
                        return ResponseEntity
                                        .status(HttpStatus.CONFLICT)
                                        .body("Username is already taken");
                }

                User user = new User();
                user.setUsername(username);
                user.setPassword(passwordEncoder.encode(password));
                user.setRole("ROLE_USER");

                userRepository.save(user);

                String token = jwtUtil.generateToken(user.getUsername());

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(new LoginResponse(
                                                token,
                                                "Registration Successful"));
        }

}