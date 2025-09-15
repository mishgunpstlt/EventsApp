package com.example.eventsbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRequestImage {

    @Id @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private EventRequest request;

    private String filename;

    public EventRequestImage(EventRequest request, String filename) {
        this.request  = request;
        this.filename = filename;
    }
}

