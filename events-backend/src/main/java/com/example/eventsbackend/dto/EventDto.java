package com.example.eventsbackend.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class EventDto {
    private Long id;

    @NotBlank(message = "Заголовок обязателен")
    private String title;

    @NotBlank(message = "Описание обязательно")
    private String description;

    @NotNull(message = "Дата обязательна")
    private LocalDateTime date;

    @NotBlank(message = "Категория обязательна")
    private String category;

    @NotBlank(message = "Формат обязателен")
    private String format;

    private String city;

    private String address;

    private String conferenceLink;

    private Double latitude;
    private Double longitude;

    @NotNull(message = "Вместимость обязательна")
    @Min(value = 1, message = "Вместимость должна быть ≥ 1")
    private Integer capacity;

    private String owner;

    private Double ownerRating;

    @NotBlank
    private String level;

    private Long ownerRatingCount;

    private List<String> imageUrls;

    @AssertTrue(message =
            "Для офлайн-события укажите city и address, " +
                    "для онлайн — conferenceLink")
    public boolean isFormatFieldsValid() {
        if ("offline".equals(format)) {
            return city != null && !city.isBlank()
                    && address != null && !address.isBlank();
        }
        if ("online".equals(format)) {
            return conferenceLink != null && !conferenceLink.isBlank();
        }
        return true;
    }
}

