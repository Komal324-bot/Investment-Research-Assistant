package com.project.investment_agent.config;

import com.project.investment_agent.entity.User;
import com.project.investment_agent.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {

@Bean
public CommandLineRunner loadUsers(UserRepository repository,
                                   PasswordEncoder encoder) {

    return args -> {

        if (repository.findByUsername("admin").isEmpty()) {

            User admin = new User();

            admin.setUsername("admin");
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");

            repository.save(admin);

            System.out.println("Admin user created successfully!");
        }

        // Add this block
        if (repository.findByUsername("john").isEmpty()) {

            User user = new User();

            user.setUsername("john");
            user.setPassword(encoder.encode("john123"));
            user.setRole("ROLE_USER");

            repository.save(user);

            System.out.println("John user created successfully!");
        }

    };
}
}