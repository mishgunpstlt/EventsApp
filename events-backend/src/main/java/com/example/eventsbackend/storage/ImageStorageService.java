package com.example.eventsbackend.storage;

import com.example.eventsbackend.model.Event;
import com.example.eventsbackend.model.EventImage;
import com.example.eventsbackend.model.EventRequest;
import com.example.eventsbackend.model.EventRequestImage;
import com.example.eventsbackend.repo.EventImageRepository;
import com.example.eventsbackend.repo.EventRequestImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.StandardCopyOption;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.function.Consumer;

// util/ImageStorageService.java
@Service
@RequiredArgsConstructor
public class ImageStorageService {

    private final EventImageRepository eventImgRepo;
    private final EventRequestImageRepository reqImgRepo;

    private final Path eventsRoot = Paths.get("uploads/events");
    private final Path reqRoot    = Paths.get("uploads/req");

    /* ---------- Загрузка ---------- */

    public List<String> saveForEvent(Event ev, MultipartFile[] files) throws IOException {
        return save(ev.getId(), files, eventsRoot,
                fn -> eventImgRepo.save(new EventImage(null, fn, ev)));
    }

    public List<String> saveForRequest(EventRequest req, MultipartFile[] files) throws IOException {
        return save(req.getId(), files, reqRoot,
                fn -> reqImgRepo.save(new EventRequestImage(req, fn)));
    }

    private List<String> save(Long parentId,
                              MultipartFile[] files,
                              Path root,
                              Consumer<String> dbSaver) throws IOException {

        Path dir = root.resolve(parentId.toString());
        Files.createDirectories(dir);

        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            String fn = UUID.randomUUID() + "-" + file.getOriginalFilename();
            try (var in = file.getInputStream()) {
                Files.copy(in, dir.resolve(fn));
            }
            dbSaver.accept(fn);
            urls.add(buildUrl(root, parentId, fn));   // /api/...
        }
        return urls;
    }

    /* ---------- Отдача / удаление ---------- */

    public Resource load(Path root, Long id, String fn) throws IOException {
        Path p = root.resolve(id.toString()).resolve(fn);
        if (!Files.exists(p)) throw new NoSuchFileException(fn);
        return new UrlResource(p.toUri());
    }

    public void deleteForEvent(Long eventId, String fn) throws IOException {
        eventImgRepo.findByEventIdAndFilename(eventId, fn).ifPresent(eventImgRepo::delete);
        Files.deleteIfExists(eventsRoot.resolve(eventId.toString()).resolve(fn));
    }

    public void deleteForRequest(Long reqId, String fn) throws IOException {
        reqImgRepo.findByRequestIdAndFilename(reqId, fn).ifPresent(reqImgRepo::delete);
        Files.deleteIfExists(reqRoot.resolve(reqId.toString()).resolve(fn));
    }

    /* ---------- helper ---------- */

    private String buildUrl(Path root, Long id, String fn) {
        String base = root.endsWith("events")
                ? "/api/events/"
                : "/api/event-requests/";
        return base + id + "/images/" + fn;
    }

    public void moveReqToEvent(Long reqId,
                               Long eventId,
                               String filename) throws IOException {

        Path src = reqRoot   //  uploads/req/{reqId}/{filename}
                .resolve(reqId.toString())
                .resolve(filename);

        Path dst = eventsRoot  // uploads/events/{eventId}/{filename}
                .resolve(eventId.toString())
                .resolve(filename);

        Files.createDirectories(dst.getParent());            // если каталога ещё нет
        Files.move(src, dst, StandardCopyOption.REPLACE_EXISTING);

        /* при желании можно подчистить пустую папку заявки
         * Path reqDir = reqRoot.resolve(reqId.toString());
         * if (Files.isDirectory(reqDir) && Files.list(reqDir).findAny().isEmpty()) {
         *     Files.delete(reqDir);
         * }
         */
    }
}

