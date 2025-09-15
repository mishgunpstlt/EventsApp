package com.example.eventsbackend.controller;

import com.example.eventsbackend.dto.EventRequestDto;
import com.example.eventsbackend.service.EventRequestService;
import com.example.eventsbackend.storage.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/event-requests")
@PreAuthorize("hasRole('USER')")      // любой залогиненный
@RequiredArgsConstructor
public class EventRequestController {
    @Autowired
    private EventRequestService service;
    private final ImageStorageService imgStore;
    private final EventRequestService reqService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventRequestDto create(@RequestBody EventRequestDto dto,
                                  Principal principal) {
        return service.createRequest(dto, principal.getName());
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public List<EventRequestDto> myRequests(Principal p) {
        return service.getMyRequests(p.getName());
    }

    @PostMapping("/{id}/images")
    public List<String> uploadReq(@PathVariable Long id,
                                  @RequestParam("files") MultipartFile[] files,
                                  Principal p) throws IOException {
        return reqService.uploadImages(id, files, p.getName());
    }

    @GetMapping("/{id}/images/{fn}")
    public ResponseEntity<Resource> getReq(@PathVariable Long id, @PathVariable String fn) throws IOException {
        Resource r = imgStore.load(Paths.get("uploads/req"), id, fn);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(Paths.get(fn)))
                .body(r);
    }

    @DeleteMapping("/{id}/images/{filename}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReqImage(@PathVariable Long id,
                               @PathVariable String filename,
                               Principal principal) throws IOException {
        service.deleteImage(id, filename, principal.getName());
    }
}
