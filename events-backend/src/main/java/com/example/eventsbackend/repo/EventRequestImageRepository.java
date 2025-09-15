package com.example.eventsbackend.repo;

import com.example.eventsbackend.model.EventRequestImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRequestImageRepository
        extends JpaRepository<EventRequestImage, Long> {

    List<EventRequestImage> findAllByRequestId(Long reqId);
    Optional<EventRequestImage> findByRequestIdAndFilename(Long reqId, String fn);
}
