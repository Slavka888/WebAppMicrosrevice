package com.example.backend.service;

import com.example.backend.DTO.TaskRequestDTO;
import com.example.backend.entity.Task;
import com.example.backend.entity.TaskStatus;
import com.example.backend.event.TaskEventPublisher;
import com.example.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskEventPublisher events;

    @Autowired
    public TaskService(TaskRepository taskRepository, TaskEventPublisher events) {
        this.taskRepository = taskRepository;
        this.events =  events;
    }

    public Task createTask(Task task) {
        taskRepository.save(task);
        return task;
    }

    public List<Task> active(String email) {
        return taskRepository.findByWorkerEmail(email).stream()
                .filter(task -> task.getStatus().equals(TaskStatus.ACTIVE))
                .toList();
    }

    public void completeTask(Long id){
        Task task = taskRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Task not found"));
        task.complete();
        taskRepository.save(task);
        events.publish("TASK_COMPLETED", task);
    }

    public void deleteForWorker(String email){
        List<Task> deleteTasks = taskRepository.findByWorkerEmail(email);
        taskRepository.deleteAll(deleteTasks);
    }
}
