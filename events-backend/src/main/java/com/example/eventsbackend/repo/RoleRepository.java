package com.example.eventsbackend.repo;

import com.example.eventsbackend.model.Role;
import com.example.eventsbackend.model.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
