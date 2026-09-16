package com.example.backend.controller;

import com.example.backend.DTO.TaskRequestDTO;
import com.example.backend.DTO.TaskResponseDTO;
import com.example.backend.entity.Task;
import com.example.backend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    private final TaskService taskService;
    private final ObjectMapper objectMapper;

    @Autowired
    public TaskController(TaskService taskService, ObjectMapper objectMapper) {
        this.taskService = taskService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<List<TaskResponseDTO>> active(@RequestParam String email) {
        List<TaskResponseDTO> response = taskService.active(email)
                .stream()
                .map(
                        task -> TaskResponseDTO.builder()
                                .workerEmail(task.getWorkerEmail())
                                .text(task.getText())
                                .id(task.getId())
                                .status(task.getStatus().name())
                                .createdAt(task.getCreatedAt().toString())
                                .build()
                ).toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/completed")
    public ResponseEntity<List<TaskResponseDTO>> completed(@RequestParam String email) {
        List<TaskResponseDTO> response = taskService.completed(email)
                .stream()
                .map(
                        task -> TaskResponseDTO.builder()
                                .workerEmail(task.getWorkerEmail())
                                .text(task.getText())
                                .id(task.getId())
                                .status(task.getStatus().name())
                                .createdAt(task.getCreatedAt().toString())
                                .build()
                ).toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<TaskResponseDTO>> workerTasks(@RequestParam String email) {
        List<TaskResponseDTO> response = taskService.allWorkerTasks(email)
                .stream()
                .map(
                        task -> TaskResponseDTO.builder()
                                .workerEmail(task.getWorkerEmail())
                                .text(task.getText())
                                .id(task.getId())
                                .status(task.getStatus().name())
                                .createdAt(task.getCreatedAt().toString())
                                .build()
                )
                .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<TaskResponseDTO> create(@RequestBody TaskRequestDTO taskRequestDTO) {
        Task task = new Task(
                taskRequestDTO.getEmail(),
                taskRequestDTO.getText()
        );
        taskService.createTask(task);
        TaskResponseDTO responseDTO = TaskResponseDTO.builder()
                .text(task.getText())
                .createdAt(task.getCreatedAt().toString())
                .workerEmail(task.getWorkerEmail())
                .status(task.getStatus().name())
                .build();
        return ResponseEntity.ok(responseDTO);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<TaskResponseDTO> complete(@PathVariable Long id) {
        try {
            taskService.completeTask(id);
            return ResponseEntity.ok(
                    TaskResponseDTO.builder()
                            .text("Task has been completed.")
                            .build()
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        try {
            taskService.delete(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @KafkaListener(topics = "user-events", groupId = "task-service=user=events")
    public void onUserEvent(String payload) {
        JsonNode jsonNode = objectMapper.readTree(payload);
        if ("USER_DELETED".equals(jsonNode.path("eventType").asText())) {
            taskService.deleteForWorker(jsonNode.path("email").asText());
        }
    }

}
