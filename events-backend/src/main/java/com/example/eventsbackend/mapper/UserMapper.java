package com.example.eventsbackend.mapper;

import com.example.eventsbackend.dto.UserDto;
import com.example.eventsbackend.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toUserDto(User user);
    User toUser(UserDto dto);

    void updateFromDto(UserDto dto, @MappingTarget User entity);
}
