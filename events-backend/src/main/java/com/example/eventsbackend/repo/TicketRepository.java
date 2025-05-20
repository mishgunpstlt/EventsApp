package com.example.eventsbackend.repo;

import com.example.eventsbackend.model.Rsvp;
import com.example.eventsbackend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByRsvp(Rsvp rsvp);
    void deleteByRsvp(Rsvp rsvp);
}
