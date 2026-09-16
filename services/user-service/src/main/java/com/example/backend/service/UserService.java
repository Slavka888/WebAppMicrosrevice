package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.event.EventPublisher;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EventPublisher events;

    @Value("${admin.email}")
    private String adminEmail;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.events = eventPublisher;
    }

    public void register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("User already exists");
        }
        userRepository.save(user);
        events.publish("USER_CREATED", user.getEmail());
    }

    public boolean authenticate(String email, String password) {
        return userRepository.findByEmail(email).map(user -> passwordEncoder.matches(password, user.getPassword())).orElse(false);
    }

    public List<String> workers() {
        return userRepository.findAll().stream()
                .map(user -> user.getEmail())
                .filter(email -> !adminEmail.equals(email))
                .sorted()
                .toList();
    }

    public void delete(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getEmail().equals(adminEmail)) {
            throw new IllegalArgumentException("Admin cannot be deleted");
        }
        userRepository.delete(user);
        events.publish("USER_DELETED", email);
    }

}
