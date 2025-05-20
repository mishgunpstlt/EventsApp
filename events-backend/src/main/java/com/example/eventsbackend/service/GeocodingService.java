// src/main/java/com/example/eventsbackend/service/GeocodingService.java
package com.example.eventsbackend.service;

import com.example.eventsbackend.model.Coordinates;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Optional;

@Service
@Slf4j
public class GeocodingService {

    private final RestTemplate rest;
    private final String apiKey;
    private static final String GEOCODE_URL = "https://geocode-maps.yandex.ru/1.x/";

    public GeocodingService(RestTemplateBuilder builder,
                            @Value("${yandex.apikey}") String apiKey) {
        this.rest = builder.build();
        this.apiKey = apiKey;
    }

    /**
     * Геокодирование адреса: возвращает координаты.
     */
    public Optional<Coordinates> geocode(String address) {
        UriComponents uri = UriComponentsBuilder.fromHttpUrl(GEOCODE_URL)
                .queryParam("apikey", apiKey)
                .queryParam("format", "json")
                .queryParam("geocode", address)
                .build();

        JsonNode root = rest.getForObject(uri.toUri(), JsonNode.class);
        JsonNode members = root.path("response")
                .path("GeoObjectCollection")
                .path("featureMember");
        if (members.isArray() && members.size() > 0) {
            JsonNode pos = members.get(0)
                    .path("GeoObject")
                    .path("Point")
                    .path("pos");
            if (!pos.isMissingNode()) {
                String[] xy = pos.asText().split(" ");
                return Optional.of(new Coordinates(
                        Double.parseDouble(xy[1]),  // latitude
                        Double.parseDouble(xy[0])   // longitude
                ));
            }
        }
        return Optional.empty();
    }

    /**
     * Извлечение города из того же ответа Яндекса.
     */
    public Optional<String> extractCity(String address) {
        UriComponents uri = UriComponentsBuilder.fromHttpUrl(GEOCODE_URL)
                .queryParam("apikey", apiKey)
                .queryParam("format", "json")
                .queryParam("geocode", address)
                .build();

        JsonNode root = rest.getForObject(uri.toUri(), JsonNode.class);
        JsonNode components = root.path("response")
                .path("GeoObjectCollection")
                .path("featureMember")
                .path(0)
                .path("GeoObject")
                .path("metaDataProperty")
                .path("GeocoderMetaData")
                .path("Address")
                .path("Components");

        if (components.isArray()) {
            for (JsonNode comp : components) {
                // kind="locality" — обычно это город
                if ("locality".equals(comp.path("kind").asText())) {
                    return Optional.of(comp.path("name").asText());
                }
            }
        }
        return Optional.empty();
    }
}

