// src/main/java/com/example/eventsbackend/model/EventImage.java
package com.example.eventsbackend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EventImage {
    @Id @GeneratedValue
    private Long id;

    private String filename;

    @ManyToOne(fetch = FetchType.LAZY)
    private Event event;
}
