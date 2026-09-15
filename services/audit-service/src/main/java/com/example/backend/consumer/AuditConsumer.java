package com.example.backend.consumer;

import com.example.backend.entity.AuditEvent;
import com.example.backend.repository.AuditEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public class AuditConsumer {
    private final AuditEventRepository auditEventRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public AuditConsumer(AuditEventRepository auditEventRepository, ObjectMapper objectMapper) {
        this.auditEventRepository = auditEventRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = {"user-events", "task-events"}, groupId = "audit-service")
    public void consume(String payload) {
        JsonNode payloadJson = objectMapper.readTree(payload);
        String eventId = payloadJson.get("eventId").asText();
        if (eventId.isBlank() || auditEventRepository.existsByEventId(eventId)) {
            return;
        }

        auditEventRepository.save(
            new AuditEvent(
                    eventId,
                    payloadJson.path("eventType").asText(),
                    payloadJson.path("entityType").asText(),
                    payloadJson.path("entityId").asText(),
                    payload
            )
        );
    }
}
