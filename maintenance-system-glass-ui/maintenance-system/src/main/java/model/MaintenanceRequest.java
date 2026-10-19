package Campus.Maintenance.System.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_requests")
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    private String location;

    private String category;

    private String status;

    private Long studentId;

    private Long assignedStaffId;

    // Photo uploaded by student when submitting the issue
    private String issuePhoto;

    // Photo uploaded by staff after completing the work
    private String completionPhoto;

    private LocalDateTime createdAt;


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }


    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }


    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }


    public Long getAssignedStaffId() {
        return assignedStaffId;
    }

    public void setAssignedStaffId(Long assignedStaffId) {
        this.assignedStaffId = assignedStaffId;
    }


    public String getIssuePhoto() {
        return issuePhoto;
    }

    public void setIssuePhoto(String issuePhoto) {
        this.issuePhoto = issuePhoto;
    }


    public String getCompletionPhoto() {
        return completionPhoto;
    }

    public void setCompletionPhoto(String completionPhoto) {
        this.completionPhoto = completionPhoto;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}