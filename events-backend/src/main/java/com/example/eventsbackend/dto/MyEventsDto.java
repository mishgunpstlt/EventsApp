package com.example.eventsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MyEventsDto {
    /** Список событий, которые текущий пользователь создал */
    private List<EventDto> createdEvents;

    /** Список событий, на которые текущий пользователь записался */
    private List<EventDto> joinedEvents;
}