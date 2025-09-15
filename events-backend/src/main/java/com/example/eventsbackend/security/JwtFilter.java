package com.example.eventsbackend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.http.*;
import jakarta.servlet.*;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Autowired JwtUtils jwtUtil;
    @Autowired UserDetailsService uds;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String path = req.getServletPath();

        // 1) Сразу пропускаем все /api/auth/** без проверки токена
        if (path.startsWith("/api/auth/") || path.startsWith("/actuator/")) {
            chain.doFilter(req, res);
            return;
        }

        // 2) Для остальных запросов — старая логика извлечения токена
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            if (jwtUtil.validate(token)) {
                String username = jwtUtil.getUsername(token);
                UserDetails ud = uds.loadUserByUsername(username);
                var authToken = new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        chain.doFilter(req, res);
    }
}
