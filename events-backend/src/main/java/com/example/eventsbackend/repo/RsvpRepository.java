// 2) src/main/java/com/example/eventsbackend/repo/RsvpRepository.java
package com.example.eventsbackend.repo;

import com.example.eventsbackend.model.Event;
import com.example.eventsbackend.model.Rsvp;
import com.example.eventsbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RsvpRepository extends JpaRepository<Rsvp, Long> {
    Optional<Rsvp> findByEventAndUser(Event event, User user);
    long countByEvent(Event event);
    @Query("select avg(r.rating) from Rsvp r where r.event = :event and r.rating is not null")
    Double findAvgRatingByEvent(@Param("event") Event event);
    @Query("""
       SELECT AVG(r.rating)
         FROM Rsvp r
        WHERE r.event.owner.username = :username
          AND r.rating IS NOT NULL
    """)
    Double avgRatingByOwner(@Param("username") String username);

    @Query("select count(r) from Rsvp r " +
            "where r.event.owner.username = :username and r.rating is not null")
    long countRatingsByOwner(@Param("username") String username);

    List<Rsvp> findAllByUser(User user);

    List<Rsvp> findAllByEventId(Long eventId);
}
