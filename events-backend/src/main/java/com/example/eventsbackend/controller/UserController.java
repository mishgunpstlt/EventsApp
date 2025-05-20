package com.example.eventsbackend.controller;

import com.example.eventsbackend.dto.UserDto;
import com.example.eventsbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public UserDto me(Principal p) {
        return userService.me(p.getName());
    }

    @PutMapping("/me")
    public UserDto updateMe(@RequestBody UserDto dto, Principal p) {
        return userService.updateMe(p.getName(), dto);
    }
}