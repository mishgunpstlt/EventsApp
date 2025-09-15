package com.example.eventsbackend.dto;

import com.example.eventsbackend.model.Role;
import lombok.Data;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
    private Set<Role> roles = new HashSet<>();
}
