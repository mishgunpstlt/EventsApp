package com.example.eventsbackend.service;

import com.example.eventsbackend.dto.UserDto;
import com.example.eventsbackend.exception.NotFoundException;
import com.example.eventsbackend.mapper.EventMapper;
import com.example.eventsbackend.mapper.UserMapper;
import com.example.eventsbackend.model.User;
import com.example.eventsbackend.repo.RsvpRepository;
import com.example.eventsbackend.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repo;
    private final UserMapper mapper;
    private final RsvpRepository rsvpRepo;

    public UserDto me(String username) {
        var u  = repo.findByUsername(username).orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        long cnt  = rsvpRepo.countRatingsByOwner(u.getUsername());
        var dto = mapper.toUserDto(u);
        dto.setOwnerRatingCount(cnt);
        dto.setOwnerRating(rsvpRepo.avgRatingByOwner(u.getUsername()));
        return dto;
    }

    public UserDto updateMe(String username, UserDto dto) {
        User user = repo.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        mapper.updateFromDto(dto, user);
        return mapper.toUserDto(repo.save(user));
    }
}
