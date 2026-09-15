package com.example.backend.repository;

import com.example.backend.entity.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    boolean existsByEventId(String eventId);
}
