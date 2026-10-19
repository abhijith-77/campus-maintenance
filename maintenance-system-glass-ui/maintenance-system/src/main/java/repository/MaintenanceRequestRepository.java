package Campus.Maintenance.System.repository;

import Campus.Maintenance.System.model.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
}