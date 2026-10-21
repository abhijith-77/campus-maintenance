
package Campus.Maintenance.System;

import Campus.Maintenance.System.model.User;
import Campus.Maintenance.System.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner createAdmin(
            UserRepository userRepository,
            Environment environment) {

        return args -> {
            String email = environment.getProperty("ADMIN_EMAIL");
            String password = environment.getProperty("ADMIN_PASSWORD");

            if (email == null || email.isBlank()
                    || password == null || password.isBlank()) {
                System.out.println(
                    "Admin not created: set ADMIN_EMAIL and ADMIN_PASSWORD."
                );
                return;
            }

            boolean exists = userRepository.findAll()
                    .stream()
                    .anyMatch(user ->
                        email.equalsIgnoreCase(user.getEmail())
                    );

            if (!exists) {
                User admin = new User();
                admin.setName("System Administrator");
                admin.setEmail(email);
                admin.setPassword(password);
                admin.setRole("ADMIN");

                userRepository.save(admin);

                System.out.println("Initial admin account created.");
            } else {
                System.out.println(
                    "Admin email already exists; no account changes made."
                );
            }
        };
    }
}
