package com.example.eventsbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // захэшированный

    private String fullName;      // ФИО
    private String gender;        // "male" | "female" | "other"
    private String email;
    private String phone;
    private LocalDate birthDate;
    private Double ownerRating;
    private Long ownerRatingCount;
}