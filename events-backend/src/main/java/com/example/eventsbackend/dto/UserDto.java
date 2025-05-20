package com.example.eventsbackend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String fullName;
    private String gender;
    private String email;
    private String phone;
    private LocalDate birthDate;
    private Double ownerRating;
    private Long ownerRatingCount;
}
