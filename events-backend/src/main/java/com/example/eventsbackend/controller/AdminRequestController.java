package com.example.eventsbackend.controller;

import com.example.eventsbackend.dto.EventRequestDto;
import com.example.eventsbackend.service.EventRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/requests")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRequestController {
    @Autowired
    private EventRequestService service;

    @GetMapping
    public List<EventRequestDto> listPending() {
        return service.getPending();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        service.approve(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        service.reject(id);
        return ResponseEntity.ok().build();
    }
}
