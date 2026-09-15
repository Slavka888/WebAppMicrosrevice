package com.example.backend.repository;

import com.example.backend.entity.Task;
import com.example.backend.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByWorkerEmail(String workerEmail);
}
