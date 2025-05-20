// src/main/java/com/example/eventsbackend/repo/EventImageRepository.java
package com.example.eventsbackend.repo;

import com.example.eventsbackend.model.EventImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventImageRepository extends JpaRepository<EventImage, Long> {
    List<EventImage> findAllByEventId(Long eventId);
    Optional<EventImage> findByEventIdAndFilename(Long eventId, String filename);
}
