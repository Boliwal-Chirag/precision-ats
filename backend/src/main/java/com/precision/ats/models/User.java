package com.precision.ats.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    private String department;
    private String location;
    private String status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<LeaveRequest> leaveRequests = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<PerformanceReview> performanceReviews = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Certification> certifications = new java.util.ArrayList<>();

    public java.util.List<LeaveRequest> getLeaveRequests() { return leaveRequests; }
    public void setLeaveRequests(java.util.List<LeaveRequest> leaveRequests) { this.leaveRequests = leaveRequests; }

    public java.util.List<PerformanceReview> getPerformanceReviews() { return performanceReviews; }
    public void setPerformanceReviews(java.util.List<PerformanceReview> performanceReviews) { this.performanceReviews = performanceReviews; }

    public java.util.List<Certification> getCertifications() { return certifications; }
    public void setCertifications(java.util.List<Certification> certifications) { this.certifications = certifications; }
}