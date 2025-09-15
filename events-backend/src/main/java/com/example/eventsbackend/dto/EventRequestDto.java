package com.example.eventsbackend.dto;

import com.example.eventsbackend.model.Event;
import com.example.eventsbackend.model.RequestStatus;
import com.example.eventsbackend.model.RequestType;
import com.example.eventsbackend.model.User;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToOne;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class EventRequestDto {
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
    private List<String> imageUrls;

    private RequestType type;       // CREATE | EDIT
    private RequestStatus status;   // PENDING | APPROVED | REJECTED
    private String authorUsername;
    private Long originalEventId;
    // геттеры/сеттеры
}
