package com.example.backend.event;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class EventPublisher {
    public static final String TOPIC = "user-events";
    private final KafkaTemplate<Object, Object> kafkaTemplate;

    @Autowired
    public EventPublisher(KafkaTemplate<Object, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(String type, String email) {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("eventType", type);
        event.put("entityType", "USER");
        event.put("entityId", email);
        event.put("email", email);
        event.put("timestamp", Instant.now().toString());
        kafkaTemplate.send(TOPIC, email, event);
    }
}
