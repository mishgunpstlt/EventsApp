package com.example.eventsbackend.mapper;

import com.example.eventsbackend.dto.EventDto;
import com.example.eventsbackend.model.Event;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EventMapper {

    /* Event  ->  EventDto */
    @Mapping(source = "owner.username", target = "owner")   // берём логин владельца
    EventDto toDto(Event event);

    /* EventDto -> Event */
    @Mapping(target = "id",    ignore = true)   // id задаётся БД
    @Mapping(target = "owner", ignore = true)   // owner ставится в сервисе
    Event toEntity(EventDto dto);
}