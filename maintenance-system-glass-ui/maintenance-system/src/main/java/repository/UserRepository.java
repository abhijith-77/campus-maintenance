package Campus.Maintenance.System.repository;

import Campus.Maintenance.System.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    long countByRole(String role);
}