package Campus.Maintenance.System.controller;

import Campus.Maintenance.System.model.MaintenanceRequest;
import Campus.Maintenance.System.service.MaintenanceRequestService;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/requests")
public class MaintenanceRequestController {

    private final MaintenanceRequestService requestService;


    public MaintenanceRequestController(
            MaintenanceRequestService requestService) {

        this.requestService = requestService;
    }


    /* =========================================================
       CREATE REQUEST
       ========================================================= */

    @PostMapping
    public MaintenanceRequest createRequest(
            @RequestBody MaintenanceRequest request) {

        return requestService.createRequest(request);
    }


    /* =========================================================
       GET ALL REQUESTS
       ========================================================= */

    @GetMapping
    public List<MaintenanceRequest> getAllRequests() {

        return requestService.getAllRequests();
    }


    /* =========================================================
       GET REQUEST BY ID
       ========================================================= */

    @GetMapping("/{id}")
    public Optional<MaintenanceRequest> getRequestById(
            @PathVariable Long id) {

        return requestService.getRequestById(id);
    }


    /* =========================================================
       UPDATE STATUS
       ========================================================= */

    @PutMapping("/{id}/status")
    public MaintenanceRequest updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return requestService.updateStatus(
                id,
                status
        );
    }


    /* =========================================================
       ASSIGN STAFF
       ========================================================= */

    @PutMapping("/{id}/assign")
    public MaintenanceRequest assignStaff(
            @PathVariable Long id,
            @RequestParam Long staffId) {

        return requestService.assignStaff(
                id,
                staffId
        );
    }


    /* =========================================================
       ASSIGN STUDENT
       ========================================================= */

    @PutMapping("/{id}/student")
    public MaintenanceRequest assignStudent(
            @PathVariable Long id,
            @RequestParam Long studentId) {

        return requestService.assignStudent(
                id,
                studentId
        );
    }


    /* =========================================================
       STUDENT ISSUE PHOTO
       PHOTO IS OPTIONAL
       ========================================================= */

    @PutMapping(
            value = "/{id}/issue-photo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public MaintenanceRequest uploadIssuePhoto(
            @PathVariable Long id,
            @RequestParam("photo") MultipartFile photo)
            throws IOException {

        return requestService.saveIssuePhoto(
                id,
                photo
        );
    }


    /* =========================================================
       STAFF COMPLETE REQUEST + PHOTO
       PHOTO IS REQUIRED
       ========================================================= */

    @PutMapping(
            value = "/{id}/complete",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public MaintenanceRequest completeRequest(
            @PathVariable Long id,
            @RequestParam("photo") MultipartFile photo)
            throws IOException {

        return requestService.completeRequest(
                id,
                photo
        );
    }


    /* =========================================================
       TOTAL REQUEST COUNT
       ========================================================= */

    @GetMapping("/count")
    public long getRequestCount() {

        return requestService.getRequestCount();
    }


    /* =========================================================
       REQUEST COUNT BY STATUS
       ========================================================= */

    @GetMapping("/count/{status}")
    public long getRequestCountByStatus(
            @PathVariable String status) {

        return requestService.getRequestCountByStatus(
                status
        );
    }


    /* =========================================================
       DELETE REQUEST
       ========================================================= */

    @DeleteMapping("/{id}")
    public String deleteRequest(
            @PathVariable Long id) {

        requestService.deleteRequest(id);

        return "Maintenance request deleted successfully";
    }
}