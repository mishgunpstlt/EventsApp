package com.example.eventsbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
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

    private List<String> imageUrls;
}

