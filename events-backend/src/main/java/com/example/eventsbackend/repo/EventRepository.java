package com.example.eventsbackend.repo;

import com.example.eventsbackend.model.Event;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOwnerUsername(String username);
    List<Event> findAll(Specification<Event> spec);
}