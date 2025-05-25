package com.example.eventsbackend.service;


import com.example.eventsbackend.dto.EventDto;
import com.example.eventsbackend.exception.NotFoundException;
import com.example.eventsbackend.mapper.EventMapper;
import com.example.eventsbackend.model.Coordinates;
import com.example.eventsbackend.model.Event;
import com.example.eventsbackend.model.EventImage;
import com.example.eventsbackend.model.User;
import com.example.eventsbackend.repo.EventImageRepository;
import com.example.eventsbackend.repo.EventRepository;
import com.example.eventsbackend.repo.RsvpRepository;
import com.example.eventsbackend.storage.ImageStorageService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository repo;
    private final EventMapper mapper;
    private final CustomUserDetailsService uds;
    private final RsvpRepository rsvpRepo;
    private final EventImageRepository eventImageRepository;
    private final Path uploadRoot = Paths.get("uploads/events");
    private final GeocodingService geocodingService;
    private final EmailService emailService;
    private final ImageStorageService imgStore;

    public List<EventDto> findAll(
            Optional<String> category,
            Optional<String> format,
            Optional<String> city,
            Optional<String> level,
            Optional<String> q,
            Optional<String> sort
    ) {
        String query    = q.filter(s -> !s.isBlank()).orElse(null);
        String sortMode = sort.orElse("date");  // date|relevance|rating|popularity

        List<Event> events = repo.searchWithFilters(
                query,
                category.orElse(null),
                format.orElse(null),
                city.orElse(null),
                level.orElse(null),
                sortMode
        );

        return events.stream()
                .map(this::toFullDto)
                .toList();
    }

    public EventDto findById(Long id) {
        return repo.findById(id)
                .map(this::toFullDto)
                .orElseThrow(() -> new NotFoundException("Событие с id=" + id + " не найдено"));
    }

    public EventDto create(EventDto dto, Principal principal) {
        final Event ev = mapper.toEntity(dto);
        ev.setOwner(uds.loadUserEntity(principal.getName()));

        // 1) геокодируем адрес и сразу сохраняем в ev
        if ("offline".equalsIgnoreCase(dto.getFormat())
                && dto.getAddress() != null
                && !dto.getAddress().isBlank()) {

            geocodingService.geocode(dto.getAddress())
                    .ifPresent(c -> {
                        ev.setLatitude(c.getLatitude());
                        ev.setLongitude(c.getLongitude());
                    });

            geocodingService.extractCity(dto.getAddress())
                    .ifPresent(ev::setCity);
        }

        Event saved = repo.save(ev);
        return toFullDto(saved);
    }

    public EventDto update(Long id, EventDto dto, Principal principal) {
        Event existing = repo.findById(id).orElseThrow(() -> new NotFoundException("Событие с id=" + id + " не найдено"));
        if (!existing.getOwner().getUsername().equals(principal.getName())) {
            throw new AccessDeniedException("Вы не являетесь владельцем этого события");
        }

        Event old = new Event();
        old.setTitle(dto.getTitle());
        old.setDescription(dto.getDescription());
        old.setDate(dto.getDate());
        old.setCategory(dto.getCategory());
        old.setFormat(dto.getFormat());
        old.setCity(dto.getCity());
        old.setAddress(dto.getAddress());
        old.setCapacity(dto.getCapacity());
        old.setLevel(dto.getLevel());
        old.setImageUrls(dto.getImageUrls());


        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setDate(dto.getDate());
        existing.setCategory(dto.getCategory());
        existing.setFormat(dto.getFormat());
        existing.setCapacity(dto.getCapacity());
        existing.setLevel(dto.getLevel());
        existing.setImageUrls(dto.getImageUrls());

        if ("offline".equalsIgnoreCase(dto.getFormat())
                && dto.getAddress() != null
                && !dto.getAddress().isBlank()) {

            geocodingService.geocode(dto.getAddress())
                    .ifPresent(c -> {
                        existing.setLatitude(c.getLatitude());
                        existing.setLongitude(c.getLongitude());
                    });

            geocodingService.extractCity(dto.getAddress())
                    .ifPresent(existing::setCity);

            existing.setAddress(dto.getAddress());
            existing.setConferenceLink(null);
        } else {
            existing.setConferenceLink(dto.getConferenceLink());
            existing.setAddress(null);
            existing.setLatitude(null);
            existing.setLongitude(null);
        }

        Event saved = repo.save(existing);

        rsvpRepo.findAllByEventId(existing.getId()).forEach(rsvp -> {
            emailService.sendEventUpdate(
                    rsvp.getUser(),
                    saved,
                    diffBetween(old, saved)
            );
        });

        return toFullDto(existing);
    }

    public void delete(Long id, Principal principal) {
        Event existing = repo.findById(id).orElseThrow(() -> new NotFoundException("Событие с id=" + id + " не найдено"));
        if (!existing.getOwner().getUsername().equals(principal.getName())) {
            throw new AccessDeniedException("Вы не являетесь владельцем этого события");
        }
        repo.delete(existing);
    }

    public List<EventDto> myEvents(Principal principal) {
        return repo.findAllByOwnerUsername(principal.getName())
                .stream().map(this::toFullDto)
                .toList();
    }

    public List<String> uploadImages(Long eventId, MultipartFile[] files) throws IOException {
        Event ev = repo.findById(eventId).orElseThrow(() -> new NotFoundException("Событие с id=" + eventId + " не найдено"));
        return imgStore.saveForEvent(ev, files);
    }

    public void deleteImage(Long eventId, String filename, Principal principal) throws IOException {
        Event ev = repo.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Событие с id=" + eventId + " не найдено"));
        if (!ev.getOwner().getUsername().equals(principal.getName())) {
            throw new AccessDeniedException("Вы не являетесь владельцем этого события");
        }
        imgStore.deleteForEvent(eventId, filename);
    }

    public EventDto toFullDto(Event ev) {
        EventDto dto = mapper.toDto(ev);

        // 1) заполняем данные по организатору и рейтинг
        String owner = ev.getOwner().getUsername();
        dto.setOwner(owner);

        Double avg = rsvpRepo.avgRatingByOwner(owner);
        dto.setOwnerRating(avg != null ? avg : 0.0);

        long cnt = rsvpRepo.countRatingsByOwner(owner);
        dto.setOwnerRatingCount(cnt);

        // 2) собираем URL’ы картинок
        List<String> urls = eventImageRepository.findAllByEventId(ev.getId())
                .stream()
                .map(img -> "/api/events/" + ev.getId() + "/images/" + img.getFilename())
                .toList();
        dto.setImageUrls(urls);

        return dto;
    }

    public String diffBetween(Event oldEv, Event newEv) {
        List<String> items = new ArrayList<>();

        if (!Objects.equals(oldEv.getTitle(), newEv.getTitle())) {
            items.add(String.format("<li><b>Название:</b> «%s» → «%s»</li>",
                    oldEv.getTitle(), newEv.getTitle()));
        }
        if (!Objects.equals(oldEv.getDescription(), newEv.getDescription())) {
            items.add(String.format("<li><b>Описание:</b> «%s» → «%s»</li>",
                    oldEv.getDescription(), newEv.getDescription()));
        }
        if (!Objects.equals(oldEv.getDate(), newEv.getDate())) {
            items.add(String.format("<li><b>Дата:</b> %s → %s</li>",
                    oldEv.getDate(), newEv.getDate()));
        }
        if (!Objects.equals(oldEv.getCategory(), newEv.getCategory())) {
            items.add(String.format("<li><b>Сфера:</b> %s → %s</li>",
                    oldEv.getCategory(), newEv.getCategory()));
        }
        if (!Objects.equals(oldEv.getFormat(), newEv.getFormat())) {
            items.add(String.format("<li><b>Формат:</b> %s → %s</li>",
                    oldEv.getFormat(), newEv.getFormat()));
        }
        if (!Objects.equals(oldEv.getAddress(), newEv.getAddress())) {
            items.add(String.format("<li><b>Адрес:</b> %s → %s</li>",
                    oldEv.getAddress(), newEv.getAddress()));
        }
        if (!Objects.equals(oldEv.getCapacity(), newEv.getCapacity())) {
            items.add(String.format("<li><b>Вместимость:</b> %d → %d</li>",
                    oldEv.getCapacity(), newEv.getCapacity()));
        }
        if (!Objects.equals(oldEv.getLevel(), newEv.getLevel())) {
            items.add(String.format("<li><b>Уровень:</b> %s → %s</li>",
                    oldEv.getLevel(), newEv.getLevel()));
        }

        if (items.isEmpty()) {
            return "<p>Изменения не содержат отличий.</p>";
        }
        return "<ul>" + String.join("", items) + "</ul>";
    }
}
