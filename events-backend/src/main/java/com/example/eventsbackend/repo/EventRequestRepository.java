package com.example.eventsbackend.repo;

import com.example.eventsbackend.model.EventRequest;
import com.example.eventsbackend.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRequestRepository extends JpaRepository<EventRequest, Long> {
    List<EventRequest> findByStatus(RequestStatus status);
    List<EventRequest> findByAuthorUsernameOrderByIdDesc(String username);
}
