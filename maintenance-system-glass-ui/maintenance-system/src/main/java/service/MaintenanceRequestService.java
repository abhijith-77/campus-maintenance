package Campus.Maintenance.System.service;

import Campus.Maintenance.System.model.MaintenanceRequest;
import Campus.Maintenance.System.repository.MaintenanceRequestRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

@Service
public class MaintenanceRequestService {

    private final MaintenanceRequestRepository requestRepository;

    private final Path uploadDirectory =
            Paths.get("uploads");


    public MaintenanceRequestService(
            MaintenanceRequestRepository requestRepository) {

        this.requestRepository = requestRepository;
    }


    /* =========================================================
       CREATE REQUEST
       ========================================================= */

    public MaintenanceRequest createRequest(
            MaintenanceRequest request) {

        if (request.getStatus() == null ||
                request.getStatus().isBlank()) {

            request.setStatus("PENDING");
        }

        return requestRepository.save(request);
    }


    /* =========================================================
       GET ALL REQUESTS
       ========================================================= */

    public List<MaintenanceRequest> getAllRequests() {

        return requestRepository.findAll();
    }


    /* =========================================================
       GET REQUEST BY ID
       ========================================================= */

    public Optional<MaintenanceRequest> getRequestById(
            Long id) {

        return requestRepository.findById(id);
    }


    /* =========================================================
       UPDATE STATUS
       ========================================================= */

    public MaintenanceRequest updateStatus(
            Long id,
            String status) {

        MaintenanceRequest request =
                requestRepository.findById(id)
                        .orElseThrow();

        request.setStatus(status);

        return requestRepository.save(request);
    }


    /* =========================================================
       ASSIGN STAFF
       ========================================================= */

    public MaintenanceRequest assignStaff(
            Long id,
            Long staffId) {

        MaintenanceRequest request =
                requestRepository.findById(id)
                        .orElseThrow();

        request.setAssignedStaffId(staffId);

        return requestRepository.save(request);
    }


    /* =========================================================
       ASSIGN STUDENT
       ========================================================= */

    public MaintenanceRequest assignStudent(
            Long id,
            Long studentId) {

        MaintenanceRequest request =
                requestRepository.findById(id)
                        .orElseThrow();

        request.setStudentId(studentId);

        return requestRepository.save(request);
    }


    /* =========================================================
       SAVE STUDENT ISSUE PHOTO
       PHOTO IS OPTIONAL
       ========================================================= */

    public MaintenanceRequest saveIssuePhoto(
            Long id,
            MultipartFile photo) throws IOException {

        MaintenanceRequest request =
                requestRepository.findById(id)
                        .orElseThrow();


        // Photo is optional
        if (photo == null || photo.isEmpty()) {
            return request;
        }


        Files.createDirectories(
                uploadDirectory
        );


        String originalFileName =
                photo.getOriginalFilename();

        String fileExtension = "";


        if (originalFileName != null &&
                originalFileName.contains(".")) {

            fileExtension =
                    originalFileName.substring(
                            originalFileName.lastIndexOf(".")
                    );
        }


        String fileName =
                "issue_" +
                id +
                "_" +
                System.currentTimeMillis() +
                fileExtension;


        Path filePath =
                uploadDirectory.resolve(fileName);


        Files.copy(
                photo.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );


        request.setIssuePhoto(fileName);


        return requestRepository.save(request);
    }


    /* =========================================================
       COMPLETE REQUEST + STAFF PHOTO
       PHOTO IS REQUIRED
       ========================================================= */

    public MaintenanceRequest completeRequest(
            Long id,
            MultipartFile photo) throws IOException {

        MaintenanceRequest request =
                requestRepository.findById(id)
                        .orElseThrow();


        if (photo == null || photo.isEmpty()) {

            throw new RuntimeException(
                    "Completion photo is required."
            );
        }


        Files.createDirectories(
                uploadDirectory
        );


        String originalFileName =
                photo.getOriginalFilename();

        String fileExtension = "";


        if (originalFileName != null &&
                originalFileName.contains(".")) {

            fileExtension =
                    originalFileName.substring(
                            originalFileName.lastIndexOf(".")
                    );
        }


        String fileName =
                "completion_" +
                id +
                "_" +
                System.currentTimeMillis() +
                fileExtension;


        Path filePath =
                uploadDirectory.resolve(fileName);


        Files.copy(
                photo.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );


        request.setCompletionPhoto(
                fileName
        );


        // Mark request as resolved
        request.setStatus("RESOLVED");


        return requestRepository.save(request);
    }


    /* =========================================================
       COUNT
       ========================================================= */

    public long getRequestCount() {

        return requestRepository.count();
    }


    /* =========================================================
       COUNT BY STATUS
       ========================================================= */

    public long getRequestCountByStatus(
            String status) {

        return requestRepository.findAll()
                .stream()
                .filter(request ->
                        request.getStatus() != null &&
                        request.getStatus()
                                .equalsIgnoreCase(status))
                .count();
    }


    /* =========================================================
       DELETE
       ========================================================= */

    public void deleteRequest(Long id) {

        requestRepository.deleteById(id);
    }
}