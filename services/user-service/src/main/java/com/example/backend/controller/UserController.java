package com.example.backend.controller;

import com.example.backend.DTO.UserRequestDTO;
import com.example.backend.DTO.UserResponseDTO;
import com.example.backend.UserServiceApplication;
import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService, NewTopic userEventsTopic) {
        this.userService = userService;
    }

    @GetMapping("/workers")
    public ResponseEntity<List<String>> getAllWorker() {
        return ResponseEntity.ok(userService.workers());
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> registerUser(@RequestBody UserRequestDTO user) {
        User newUser = User.builder()
                .email(user.getEmail())
                .password(user.getPassword())
                .build();
        try {
            userService.register(newUser);
            return ResponseEntity.ok(
                    UserResponseDTO.builder()
                            .message("User registered successfully!")
                            .build()
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> loginUser(@RequestBody UserRequestDTO user) {
        String email = user.getEmail();
        if (userService.authenticate(email, user.getPassword())) {
            boolean admin = UserServiceApplication.ADMIN_EMAIL.equals(email);
            return ResponseEntity.ok(
                    UserResponseDTO.builder()
                        .message(admin ? "Logged in Successfully! You are administrator" : "Logged in successfully! You are user")
                        .role(admin ? "ADMIN" : "USER")
                        .build()
            );
        }
        return ResponseEntity.ok(
                UserResponseDTO.builder()
                        .message("Please, register in system!")
                        .build()
        );
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteUser(@RequestBody UserRequestDTO user) {
        try {
            userService.delete(user.getEmail());
            return ResponseEntity.noContent().build();
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
