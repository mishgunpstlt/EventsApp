package com.example.eventsbackend.service;

import com.example.eventsbackend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import com.example.eventsbackend.model.User;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.stream.Collectors;
import java.util.List;

import static org.springframework.security.core.userdetails.User.withUsername;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired UserRepository repo;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) {
        System.out.println(">>> loadUserByUsername: " + username);
        User user = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        System.out.println(">>> Found user: " + user.getUsername());
        System.out.println(">>> Roles in DB: " +
                user.getRoles().stream().map(r -> r.getName().name()).toList());

        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(r -> new SimpleGrantedAuthority(r.getName().name()))
                .collect(Collectors.toList());

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities
        );
    }

    public User loadUserEntity(String username) {
        return repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
    }
}
