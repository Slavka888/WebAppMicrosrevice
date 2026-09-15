package com.example.backend.event;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {
    @Bean
    NewTopic taskEventsTopic() {
        return new NewTopic(TaskEventPublisher.TOPIC, 1, (short) 1);
    }
}
