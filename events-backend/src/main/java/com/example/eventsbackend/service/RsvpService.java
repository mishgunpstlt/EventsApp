// 4) src/main/java/com/example/eventsbackend/service/RsvpService.java
package com.example.eventsbackend.service;

import com.example.eventsbackend.dto.EventDto;
import com.example.eventsbackend.dto.RsvpDto;
import com.example.eventsbackend.exception.BadRequestException;
import com.example.eventsbackend.exception.NotFoundException;
import com.example.eventsbackend.model.Event;
import com.example.eventsbackend.model.Rsvp;
import com.example.eventsbackend.model.Ticket;
import com.example.eventsbackend.model.User;
import com.example.eventsbackend.repo.EventRepository;
import com.example.eventsbackend.repo.RsvpRepository;
import com.example.eventsbackend.repo.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RsvpService {

    private final RsvpRepository rsvpRepo;
    private final EventRepository eventRepo;
    private final CustomUserDetailsService uds;
    private final EventService eventService;
    private final EmailService emailService;
    private final TicketRepository ticketRepo;


    @Transactional
    public RsvpDto toggleRsvp(Long eventId, Principal principal) {
        User user = uds.loadUserEntity(principal.getName());
        if (user.getEmail() == null) {
            throw new BadRequestException("У вашего профиля не задан email — письмо не может быть отправлено");
        }

        Event ev = eventRepo.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Событие не найдено"));

        Optional<Rsvp> existing = rsvpRepo.findByEventAndUser(ev, user);
        if (existing.isPresent()) {
            // отмена — удаляем билет и RSVP
            ticketRepo.deleteByRsvp(existing.get());
            rsvpRepo.delete(existing.get());
            return buildDto(ev, user);
        }

        // новая запись
        Rsvp r = new Rsvp();
        r.setEvent(ev);
        r.setUser(user);
        r.setTimestamp(LocalDateTime.now());
        r = rsvpRepo.save(r);

        if ("online".equalsIgnoreCase(ev.getFormat())) {
            // для онлайн — отправляем ссылку
            emailService.sendConferenceLink(user, ev);
        } else {
            // для оффлайн — генерим и шлём билет
            String code = UUID.randomUUID().toString().substring(0,8).toUpperCase();
            Ticket t = new Ticket();
            t.setCode(code);
            t.setRsvp(r);
            ticketRepo.save(t);

            emailService.sendTicket(user, ev, code);
        }

        return buildDto(ev, user);
    }

    public RsvpDto rateEvent(Long eventId, int rating, Principal principal) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be 1–5");
        }
        User user = uds.loadUserEntity(principal.getName());
        Event ev = eventRepo.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Событие с id=" + eventId + " не найдено"));

        Rsvp r = rsvpRepo.findByEventAndUser(ev, user)
                .orElseGet(() -> {
                    Rsvp x = new Rsvp();
                    x.setEvent(ev);
                    x.setUser(user);
                    x.setTimestamp(LocalDateTime.now());
                    return x;
                });
        r.setRating(rating);
        rsvpRepo.save(r);

        return buildDto(ev, user);
    }

    public Double getAverageRating(Long eventId) {
        Event ev = eventRepo.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found"));
        return rsvpRepo.findAvgRatingByEvent(ev);
    }

    public RsvpDto getRsvpStatus(Long eventId, Principal principal) {
        User user = uds.loadUserEntity(principal.getName());
        Event ev = eventRepo.findById(eventId).orElseThrow(() -> new NotFoundException("Событие с id=" + eventId + " не найдено"));

        return buildDto(ev, user);
    }

    public List<EventDto> findMyRsvpEvents(Principal principal) {
        User user = uds.loadUserEntity(principal.getName());
        return rsvpRepo.findAllByUser(user).stream()
                .map(Rsvp::getEvent)
                .map(eventService::toFullDto)
                .toList();
    }

    private RsvpDto buildDto(Event ev, User user) {
        long count = rsvpRepo.countByEvent(ev);
        Double avg = rsvpRepo.findAvgRatingByEvent(ev);
        boolean going = rsvpRepo.findByEventAndUser(ev, user).isPresent();

        Integer userRating = rsvpRepo.findByEventAndUser(ev, user)
                .flatMap(r -> Optional.ofNullable(r.getRating()))
                .orElse(null);

        return new RsvpDto(
                count,
                going,
                avg != null ? avg : 0.0,
                userRating
        );
    }
}
