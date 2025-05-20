package com.example.eventsbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    @Id @GeneratedValue
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @OneToOne(fetch = FetchType.LAZY)
    private Rsvp rsvp;
}
