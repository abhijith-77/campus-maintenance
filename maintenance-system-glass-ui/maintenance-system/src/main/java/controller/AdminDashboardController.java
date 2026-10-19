package Campus.Maintenance.System.controller;

import Campus.Maintenance.System.model.DashboardResponse;
import Campus.Maintenance.System.service.MaintenanceRequestService;
import Campus.Maintenance.System.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
public class AdminDashboardController {

    private final UserService userService;
    private final MaintenanceRequestService requestService;

    public AdminDashboardController(
            UserService userService,
            MaintenanceRequestService requestService) {

        this.userService = userService;
        this.requestService = requestService;
    }

    @GetMapping("/dashboard")
    public DashboardResponse getDashboard() {

        DashboardResponse response = new DashboardResponse();

        response.setTotalUsers(userService.getUserCount());
        response.setTotalStaff(userService.getStaffCount());
        response.setTotalRequests(requestService.getRequestCount());
        response.setPendingRequests(
                requestService.getRequestCountByStatus("PENDING"));
        response.setInProgressRequests(
                requestService.getRequestCountByStatus("IN_PROGRESS"));
        response.setResolvedRequests(
                requestService.getRequestCountByStatus("RESOLVED"));

        return response;
    }
}