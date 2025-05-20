package com.example.eventsbackend.controller;

import com.example.eventsbackend.dto.EventDto;
import com.example.eventsbackend.dto.MyEventsDto;
import com.example.eventsbackend.service.EventService;
import com.example.eventsbackend.service.RsvpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final RsvpService rsvpService;

    @GetMapping
    public List<EventDto> listAll(
            @RequestParam Optional<String> category,
            @RequestParam Optional<String> format,
            @RequestParam Optional<String> city,
            @RequestParam(required = false) Optional<String> level,
            @RequestParam(defaultValue = "date") Optional<String> sort
    ) {
        return eventService.findAll(category, format, city, level, sort);
    }

    @GetMapping("/{id}")
    public EventDto getById(@PathVariable Long id) {
        return eventService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventDto create(@Valid @RequestBody EventDto dto, Principal principal) {
        return eventService.create(dto, principal);
    }

    @PutMapping("/{id}")
    public EventDto update(
            @PathVariable Long id,
            @Valid @RequestBody EventDto dto,
            Principal principal
    ) {
        return eventService.update(id, dto, principal);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Principal principal) {
        eventService.delete(id, principal);
    }

    @GetMapping("/my/all")
    public MyEventsDto myAllEvents(Principal principal) {
        var created = eventService.myEvents(principal);
        var joined  = rsvpService.findMyRsvpEvents(principal);
        return new MyEventsDto(created, joined);
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<List<String>> uploadImages(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files
    ) throws IOException {
        List<String> urls = eventService.uploadImages(id, files);
        return ResponseEntity.ok(urls);
    }

    // статическая раздача файлов:
    @GetMapping("/{id}/images/{filename}")
    public ResponseEntity<Resource> getImage(
            @PathVariable Long id,
            @PathVariable String filename
    ) throws IOException {
        Path file = Paths.get("uploads/events")
                .resolve(id.toString())
                .resolve(filename);
        Resource res = new UrlResource(file.toUri());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(file))
                .body(res);
    }

    @DeleteMapping("/{id}/images/{filename}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteImage(
            @PathVariable Long id,
            @PathVariable String filename,
            Principal principal
    ) throws IOException {
        eventService.deleteImage(id, filename, principal);
    }
}
