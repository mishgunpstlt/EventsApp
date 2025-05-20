// 1) src/main/java/com/example/eventsbackend/model/Rsvp.java
package com.example.eventsbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(uniqueConstraints = {
        // чтобы один пользователь мог RSVP+rate только один раз
        @UniqueConstraint(columnNames = {"event_id", "user_id"})
})
public class Rsvp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Event event;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User user;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    /**
     * Оценка события (1–5).
     * Если пользователь ещё не оценил, останется null.
     */
    @Column
    private Integer rating;
}
