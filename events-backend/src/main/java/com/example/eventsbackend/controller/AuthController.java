package com.example.eventsbackend.controller;

import com.example.eventsbackend.model.User;
import com.example.eventsbackend.repo.UserRepository;
import com.example.eventsbackend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.bcrypt.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired UserRepository userRepo;
    @Autowired AuthenticationManager authManager;
    @Autowired JwtUtils jwtUtil;
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String,String> body) {
        if (userRepo.findByUsername(body.get("username")).isPresent())
            throw new RuntimeException("Пользователь существует");
        var user = new User();
        user.setUsername(body.get("username"));
        user.setPassword(encoder.encode(body.get("password")));
        userRepo.save(user);
        String token = jwtUtil.generateToken(user.getUsername());
        return Map.of("token", token);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String,String> body) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(body.get("username"), body.get("password"))
        );
        String token = jwtUtil.generateToken(body.get("username"));
        return Map.of("token", token);
    }
}
