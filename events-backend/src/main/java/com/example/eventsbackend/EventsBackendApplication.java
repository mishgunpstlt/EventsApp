package com.example.eventsbackend;

import com.example.eventsbackend.model.Role;
import com.example.eventsbackend.model.RoleName;
import com.example.eventsbackend.model.User;
import com.example.eventsbackend.repo.RoleRepository;
import com.example.eventsbackend.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@SpringBootApplication
public class EventsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(EventsBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner initAdmin(RoleRepository roleRepo,
								UserRepository userRepo,
								PasswordEncoder encoder) {
		return args -> {
			// 1) Создать роль, если нет
			var adminRole = roleRepo.findByName(RoleName.ROLE_ADMIN)
					.orElseGet(() -> roleRepo.save(new Role(RoleName.ROLE_ADMIN)));

			// 2) Создать пользователя admin, если нет
			if (userRepo.findByUsername("admin").isEmpty()) {
				User admin = new User();
				admin.setUsername("admin");
				admin.setPassword(encoder.encode("admin123"));
				admin.setEmail("admin@example.com");
				admin.setFullName("Administrator");
				admin.setRoles(Set.of(adminRole));
				userRepo.save(admin);
			}
		};
	}

}
