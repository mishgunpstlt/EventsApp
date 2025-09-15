package com.example.eventsbackend.controller;

import com.example.eventsbackend.model.Role;
import com.example.eventsbackend.model.RoleName;
import com.example.eventsbackend.model.User;
import com.example.eventsbackend.repo.UserRepository;
import com.example.eventsbackend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.*;
import org.springframework.web.bind.annotation.*;
import com.example.eventsbackend.repo.RoleRepository;


import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired UserRepository userRepo;
    @Autowired AuthenticationManager authManager;
    @Autowired JwtUtils jwtUtil;
    @Autowired RoleRepository roleRepo;
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(@RequestBody Map<String,String> body) {
        if (userRepo.findByUsername(body.get("username")).isPresent())
            throw new RuntimeException("Пользователь существует");

        var user = new User();
        user.setUsername(body.get("username"));
        user.setPassword(encoder.encode(body.get("password")));

        // назначаем ROLE_USER
        Role userRole = roleRepo.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> roleRepo.save(new Role(RoleName.ROLE_USER)));
        user.setRoles(Set.of(userRole));

        userRepo.save(user);
        String token = jwtUtil.generateToken(user.getUsername());
        return Map.of("token", token);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String,String> body) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(body.get("username"), body.get("password"))
            );
        } catch (AuthenticationException ex) {
            throw new RuntimeException("Не удалось аутентифицировать: " + ex.getMessage());
        }
        String token = jwtUtil.generateToken(body.get("username"));
        return Map.of("token", token);
    }
}
