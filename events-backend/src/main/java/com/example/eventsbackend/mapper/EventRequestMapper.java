package com.example.eventsbackend.mapper;

import com.example.eventsbackend.dto.EventRequestDto;
import com.example.eventsbackend.model.EventRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EventRequestMapper {
    @Mapping(source = "author.username", target = "authorUsername")
    @Mapping(source = "originalEvent.id", target = "originalEventId")
    EventRequestDto toDto(EventRequest req);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "originalEvent", ignore = true)
    EventRequest toEntity(EventRequestDto dto);
}
