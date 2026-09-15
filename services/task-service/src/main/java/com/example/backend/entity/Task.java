package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@NoArgsConstructor
@Data
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String workerEmail;

    @Column(nullable = false, length = 4000)
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Column(nullable = false)
    private Instant createdAt;
    private Instant completedAt;

    public Task(String workerEmail, String text) {
        this.workerEmail = workerEmail;
        this.text = text;
        this.status = TaskStatus.ACTIVE;
        this.createdAt = Instant.now();
    }

    public void complete() {
        status = TaskStatus.COMPLETED;
        completedAt = Instant.now();
    }
}
