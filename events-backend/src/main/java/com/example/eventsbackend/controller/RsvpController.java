//src/main/java/com/example/eventsbackend/controller/RsvpController.java
package com.example.eventsbackend.controller;

import com.example.eventsbackend.dto.RsvpDto;
import com.example.eventsbackend.service.RsvpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/events/{id}/rsvp")
@RequiredArgsConstructor
public class RsvpController {

    private final RsvpService service;

    @GetMapping
    public ResponseEntity<RsvpDto> status(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(service.getRsvpStatus(id, principal));
    }

    @PostMapping
    public ResponseEntity<RsvpDto> toggle(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(service.toggleRsvp(id, principal));
    }

    @PostMapping("/rate")
    public ResponseEntity<RsvpDto> rate(
            @PathVariable Long id,
            @RequestParam int rating,
            Principal principal
    ) {
        var dto = service.rateEvent(id, rating, principal);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/average")
    public ResponseEntity<Double> average(@PathVariable Long id) {
        return ResponseEntity.ok(service.getAverageRating(id));
    }
}
