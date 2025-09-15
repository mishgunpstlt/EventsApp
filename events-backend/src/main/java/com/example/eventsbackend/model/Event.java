package com.example.eventsbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Event {
    @Id @GeneratedValue
    private Long id;
    private String title;
    private String description;
    private LocalDateTime date;
    private Integer capacity;

    @Column(nullable = false)
    private String category;    // ИТ, Маркетинг, Медицина...

    @Column(nullable = false)
    private String format;      // "offline" или "online"

    // старое поле «city» оставляем — для фильтрации по локалити
    @Column
    private String city;
    // новое текстовое поле — полный адрес
    @Column private String address;
    // координаты
    private Double latitude;
    private Double longitude;

    @Column
    private String conferenceLink;

    @ManyToOne(fetch = FetchType.LAZY)
    private User owner;

    private Double ownerRating;

    @Column(nullable = false)
    private String level;

    private Long ownerRatingCount;


    /***
     * Картинки, прикреплённые к событию.
     *  - CascadeType.ALL  → сначала удалим их, потом само событие
     *  - orphanRemoval    → удаление из коллекции = DELETE в БД
     */
    @OneToMany(mappedBy = "event",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @JsonIgnoreProperties("event")
    private List<EventImage> images = new ArrayList<>();

    /* ------ остальное без изменений ------ */

    @OneToMany(mappedBy = "originalEvent",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnoreProperties("originalEvent")
    private List<EventRequest> editRequests = List.of();

    @OneToMany(mappedBy = "event",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnoreProperties("event")
    private List<Rsvp> rsvps = List.of();

    /**
     * Это поле используете только в DTO — хранить в БД не нужно.
     */
    @Transient              // <—
    private List<String> imageUrls;
}

