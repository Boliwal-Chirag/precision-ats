package com.precision.ats.controllers;

import com.precision.ats.models.User;
import com.precision.ats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/employees
     * Returns basic info for all ROLE_EMPLOYEE users (no lazy collections).
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllEmployees() {
        List<User> employees = userRepository.findByRoleName("ROLE_EMPLOYEE");
        List<Map<String, Object>> result = employees.stream().map(this::toBasicMap).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/employees/{id}
     * Returns full profile including lazy-loaded leaves, reviews, certs.
     */
    @Transactional(readOnly = true)
    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeProfile(@PathVariable Long id) {
        return userRepository.findById(id).map(u -> ResponseEntity.ok(toDetailMap(u)))
               .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        User user = opt.get();
        if (body.containsKey("name")) user.setName(body.get("name"));
        if (body.containsKey("email")) user.setEmail(body.get("email"));
        if (body.containsKey("department")) user.setDepartment(body.get("department"));
        if (body.containsKey("location")) user.setLocation(body.get("location"));
        if (body.containsKey("status")) {
            String newStatus = body.get("status");
            user.setStatus(newStatus);
            if ("Hired".equalsIgnoreCase(newStatus)) {
                user.setRole(new com.precision.ats.models.Role(3L, "ROLE_EMPLOYEE"));
            }
        }
        userRepository.save(user);
        return ResponseEntity.ok(toBasicMap(user));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Basic map — safe outside a transaction (no lazy collections). */
    private Map<String, Object> toBasicMap(User u) {
        String name = u.getName() != null ? u.getName() : "";
        String initials = Arrays.stream(name.split("\\s+"))
                .filter(w -> !w.isEmpty())
                .map(w -> String.valueOf(w.charAt(0)).toUpperCase())
                .limit(2)
                .collect(Collectors.joining());

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("name", name);
        m.put("role", u.getDepartment() != null ? u.getDepartment() : "Employee");
        m.put("department", u.getDepartment() != null ? u.getDepartment() : "");
        m.put("location", u.getLocation() != null ? u.getLocation() : "");
        m.put("email", u.getEmail() != null ? u.getEmail() : "");
        m.put("status", u.getStatus() != null ? u.getStatus() : "Active");
        m.put("initials", initials);
        return m;
    }

    /** Detail map — must be called inside @Transactional to access lazy collections.
     *  Converts sub-entities to plain maps to avoid circular serialization (User ↔ child). */
    private Map<String, Object> toDetailMap(User u) {
        Map<String, Object> m = toBasicMap(u);
        m.put("notes", u.getNotes() != null ? u.getNotes() : "");

        // Map leaves — strip the User back-reference
        List<Map<String, Object>> leaves = new ArrayList<>();
        if (u.getLeaveRequests() != null) {
            for (var lr : u.getLeaveRequests()) {
                Map<String, Object> lm = new LinkedHashMap<>();
                lm.put("id", lr.getId());
                lm.put("type", lr.getType());
                lm.put("dates", lr.getDates());
                lm.put("status", lr.getStatus());
                leaves.add(lm);
            }
        }
        m.put("leaves", leaves);

        // Map performance reviews
        List<Map<String, Object>> reviews = new ArrayList<>();
        if (u.getPerformanceReviews() != null) {
            for (var pr : u.getPerformanceReviews()) {
                Map<String, Object> rm = new LinkedHashMap<>();
                rm.put("id", pr.getId());
                rm.put("period", pr.getPeriod());
                rm.put("rating", pr.getRating());
                rm.put("feedback", pr.getFeedback());
                reviews.add(rm);
            }
        }
        m.put("performanceReviews", reviews);

        // Map certifications
        List<Map<String, Object>> certs = new ArrayList<>();
        if (u.getCertifications() != null) {
            for (var c : u.getCertifications()) {
                Map<String, Object> cm = new LinkedHashMap<>();
                cm.put("id", c.getId());
                cm.put("name", c.getName());
                cm.put("issueDate", c.getIssueDate());
                certs.add(cm);
            }
        }
        m.put("certifications", certs);

        return m;
    }
}