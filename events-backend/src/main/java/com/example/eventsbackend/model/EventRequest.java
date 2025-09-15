package com.example.eventsbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "event_requests")
public class EventRequest {
    @Id @GeneratedValue
    private Long id;
    private String title;
    private String description;
    private LocalDateTime date;
    private String category;
    private String format;          // "online"/"offline"
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private String conferenceLink;
    private Integer capacity;
    private String level;

    @OneToMany(mappedBy = "request",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnoreProperties("request")
    private List<EventRequestImage> images = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private RequestType type;       // CREATE | EDIT
    @Enumerated(EnumType.STRING)
    private RequestStatus status;   // PENDING | APPROVED | REJECTED
    @ManyToOne
    private User author;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_event_id")
    private Event originalEvent; // nullable для CREATE
}
