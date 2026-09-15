package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "audit_events")
@NoArgsConstructor
@Data
public class AuditEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String eventId;
    @Column(nullable = false)
    private String eventType;
    @Column(nullable = false)
    private String entityType;
    @Column(nullable = false)
    private String entityId;
    @Column(nullable = false, length = 10000)
    private String payload;
    @Column(nullable = false)
    private Instant createdAt;

    public AuditEvent(String eventId, String eventType, String entityType, String entityId, String payload) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.entityType = entityType;
        this.entityId = entityId;
        this.payload = payload;
        this.createdAt = Instant.now();
    }
}
