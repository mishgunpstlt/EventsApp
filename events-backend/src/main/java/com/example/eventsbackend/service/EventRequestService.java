package com.example.eventsbackend.service;

import com.example.eventsbackend.dto.EventRequestDto;
import com.example.eventsbackend.exception.NotFoundException;
import com.example.eventsbackend.mapper.EventRequestMapper;
import com.example.eventsbackend.model.*;
import com.example.eventsbackend.repo.*;
import com.example.eventsbackend.storage.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventRequestService {

    private final EventRequestRepository        repo;
    private final EventRepository               eventRepo;
    private final UserRepository                userRepo;
    private final EventRequestMapper            mapper;
    private final GeocodingService              geocoding;
    private final EmailService                  emailService;
    private final EventService                  eventService;
    private final RsvpRepository                rsvpRepo;
    private final ImageStorageService           imgStore;
    private final EventImageRepository          eventImgRepo;
    private final EventRequestImageRepository   reqImgRepo;

    public EventRequestDto createRequest(EventRequestDto dto, String username) {
        EventRequest req = mapper.toEntity(dto);
        req.setAuthor(userRepo.findByUsername(username).orElseThrow());
        if (dto.getType() == RequestType.EDIT)
            req.setOriginalEvent(eventRepo.findById(dto.getOriginalEventId()).orElseThrow());
        repo.save(req);
        return mapper.toDto(req);
    }

    public List<EventRequestDto> getPending() {
        return repo.findByStatus(RequestStatus.PENDING)
                .stream().map(this::toDtoWithImages).toList();
    }

    @Transactional
    public void approve(Long id) {
        EventRequest req = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (req.getType() == RequestType.CREATE) {
            Event ev = new Event();
            copy(req, ev);                 // все поля!
            eventRepo.save(ev);
            for (EventRequestImage ri : reqImgRepo.findAllByRequestId(req.getId())) {
                try {
                    imgStore.moveReqToEvent(req.getId(), ev.getId(), ri.getFilename());
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
                eventImgRepo.save(new EventImage(null, ri.getFilename(), ev));
            }
        } else {                           // EDIT
            Event ev  = req.getOriginalEvent();

            /* ---------- 1. diff «до/после» ---------- */
            Event before = new Event();
            org.springframework.beans.BeanUtils.copyProperties(ev, before);

            /* ---------- 2. перенос полей ---------- */
            copy(req, ev);
            eventRepo.save(ev);

            /* ---------- 3. синхронизация картинок ---------- */
            // что есть в событии прямо сейчас
            Set<String> oldFiles = eventImgRepo.findAllByEventId(ev.getId())
                    .stream()
                    .map(EventImage::getFilename)
                    .collect(Collectors.toSet());

            // что осталось в заявке после редактирования
            Set<String> newFiles = reqImgRepo.findAllByRequestId(req.getId())
                    .stream()
                    .map(EventRequestImage::getFilename)
                    .collect(Collectors.toSet());

            /* 3-а. Добавляем новые файлы */
            for (String fn : newFiles) {
                if (!oldFiles.contains(fn)) {
                    try {
                        imgStore.moveReqToEvent(req.getId(), ev.getId(), fn);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                    eventImgRepo.save(new EventImage(null, fn, ev));
                }
            }

            /* 3-б. Удаляем лишние */
            for (String fn : oldFiles) {
                if (!newFiles.contains(fn)) {
                    try {
                        imgStore.deleteForEvent(ev.getId(), fn);   // удалит БД + файл
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }
            }

            /* ---------- 4. уведомляем участников ---------- */
            String diffHtml = eventService.diffBetween(before, ev);
            rsvpRepo.findAllByEventId(ev.getId())
                    .forEach(r -> emailService.sendEventUpdate(r.getUser(), ev, diffHtml));
        }
        req.setStatus(RequestStatus.APPROVED);
        repo.save(req);
    }

    private void copy(EventRequest src, Event dest) {
        dest.setTitle(src.getTitle());
        dest.setDescription(src.getDescription());
        dest.setDate(src.getDate());
        dest.setCategory(src.getCategory());
        dest.setFormat(src.getFormat());
        dest.setCapacity(src.getCapacity());
        dest.setLevel(src.getLevel());

        if ("offline".equals(src.getFormat())) {
            dest.setAddress(src.getAddress());
            dest.setCity(src.getCity());
            dest.setLatitude(src.getLatitude());
            dest.setLongitude(src.getLongitude());

            // --- ДОБАВЬТЕ: геокодируем, если координат нет ---
            if (dest.getLatitude() == null || dest.getLongitude() == null) {
                geocoding.geocode(src.getAddress()).ifPresent(c -> {
                    dest.setLatitude(c.getLatitude());
                    dest.setLongitude(c.getLongitude());
                });
            }
            if (dest.getCity() == null || dest.getCity().isBlank()) {
                geocoding.extractCity(src.getAddress()).ifPresent(dest::setCity);
            }
            dest.setConferenceLink(null);
        } else {               // online
            dest.setConferenceLink(src.getConferenceLink());
            dest.setAddress(null);
            dest.setCity(null);
            dest.setLatitude(null);
            dest.setLongitude(null);
        }
        dest.setOwner(src.getAuthor());
    }

    public void reject(Long id) {
        EventRequest req = repo.findById(id).orElseThrow();
        req.setStatus(RequestStatus.REJECTED);
        repo.save(req);
    }

    public List<EventRequestDto> getMyRequests(String username) {
        return repo.findByAuthorUsernameOrderByIdDesc(username)
                .stream()
                .map(this::toDtoWithImages)
                .toList();
    }

    public List<String> uploadImages(Long reqId, MultipartFile[] files, String username) throws IOException {
        EventRequest req = repo.findById(reqId)
                .orElseThrow(() -> new NotFoundException("Событие с id=" + reqId + " не найдено"));
        if (!req.getAuthor().getUsername().equals(username)) throw new AccessDeniedException("...");
        return imgStore.saveForRequest(req, files);
    }

    public EventRequestDto toDtoWithImages(EventRequest req) {
        EventRequestDto dto = mapper.toDto(req);
        List<String> urls = reqImgRepo.findAllByRequestId(req.getId())
                .stream()
                .map(img -> "/api/event-requests/" + req.getId() + "/images/" + img.getFilename())
                .toList();
        dto.setImageUrls(urls);
        return dto;
    }

    /** Удалить картинку из заявки (до модерации) */
    public void deleteImage(Long reqId, String filename, String username) throws IOException {
        EventRequest req = repo.findById(reqId)
                .orElseThrow(() -> new NotFoundException("Заявка id=" + reqId + " не найдена"));

        if (!req.getAuthor().getUsername().equals(username))
            throw new AccessDeniedException("Вы не автор этой заявки");

        imgStore.deleteForRequest(reqId, filename);
    }
}
