package com.example.backend.event;

import com.example.backend.entity.Task;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class TaskEventPublisher {
    public static final String TOPIC = "task-events";
    private final KafkaTemplate<Object, Object> kafka;

    public TaskEventPublisher(KafkaTemplate<Object, Object> kafka) {
        this.kafka = kafka;
    }

    public void publish(String type, Task task) {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("eventType", type);
        event.put("entityType", "TASK");
        event.put("entityId", String.valueOf(task.getId()));
        event.put("taskId", task.getId());
        event.put("workerEmail", task.getWorkerEmail());
        event.put("taskText", task.getText());
        event.put("timestamp", Instant.now().toString());
        kafka.send(TOPIC, String.valueOf(task.getId()), event);
    }
}
