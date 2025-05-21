package com.example.eventsbackend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "roles")
@Data
public class Role {
    @Id
    @GeneratedValue
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private RoleName name;

    // ===== Дефолтный конструктор для JPA =====
    public Role() {}

    // Ваш конструктор для удобства
    public Role(RoleName name) {
        this.name = name;
    }
}