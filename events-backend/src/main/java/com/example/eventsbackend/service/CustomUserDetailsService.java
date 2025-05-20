package com.example.eventsbackend.service;

import com.example.eventsbackend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import com.example.eventsbackend.model.User;

import static org.springframework.security.core.userdetails.User.withUsername;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired UserRepository repo;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        return withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities("USER").build();
    }

    public User loadUserEntity(String username) {
        return repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
    }
}
