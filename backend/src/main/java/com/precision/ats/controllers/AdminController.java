package com.precision.ats.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.precision.ats.models.User;
import com.precision.ats.models.AuditLog;
import com.precision.ats.repository.UserRepository;
import com.precision.ats.repository.AuditLogRepository;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @GetMapping("/stats")
    public Map<String, Long> getPipelineStats() {
        List<User> candidates = userRepository.findByRoleName("ROLE_CANDIDATE");
        List<User> employees = userRepository.findByRoleName("ROLE_EMPLOYEE");
        long applied = candidates.stream().filter(c -> "Applied".equalsIgnoreCase(c.getStatus())).count();
        long interviewing = candidates.stream().filter(c -> "Interviewing".equalsIgnoreCase(c.getStatus())).count();
        long offered = candidates.stream().filter(c -> "Offered".equalsIgnoreCase(c.getStatus())).count();
        long hired = employees.size();

        return Map.of(
            "applied", applied,
            "interviewing", interviewing,
            "offered", offered,
            "hired", hired,
            "total", (long) candidates.size() + hired
        );
    }
    
    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsers() {
        List<User> all = userRepository.findAll();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (User u : all) {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole().getName());
            m.put("department", u.getDepartment());
            m.put("status", u.getStatus() != null ? u.getStatus() : "Active");
            result.add(m);
        }
        return result;
    }

    @PutMapping("/users/{id}/status")
    public java.util.Map<String, String> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id).orElseThrow();
        user.setStatus(body.get("status"));
        userRepository.save(user);
        return Map.of("message", "Status updated");
    }

    @GetMapping("/logs")
    public List<AuditLog> getSystemLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}