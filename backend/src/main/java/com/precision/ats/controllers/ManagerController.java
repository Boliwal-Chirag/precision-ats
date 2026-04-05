package com.precision.ats.controllers;

import com.precision.ats.models.User;
import com.precision.ats.models.Role;
import com.precision.ats.repository.UserRepository;
import com.precision.ats.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Returns the currently authenticated user from the JWT principal (email). */
    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        String email = auth.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    // ── Team ─────────────────────────────────────────────────────────────────

    @GetMapping("/team")
    public ResponseEntity<List<Map<String, Object>>> getTeam(Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        if (email == null) return ResponseEntity.status(401).build();

        Optional<User> managerOpt = userRepository.findByEmail(email);
        if (managerOpt.isEmpty()) return ResponseEntity.notFound().build();

        List<User> team = userRepository.findByManagerId(managerOpt.get().getId());
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (User u : team) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("role", u.getDepartment() != null ? u.getDepartment() : "Employee");
            map.put("match", "95%");
            map.put("status", u.getStatus() != null ? u.getStatus() : "Active");
            map.put("email", u.getEmail());
            map.put("notes", u.getNotes() != null ? u.getNotes() : "");
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @PutMapping("/team/{id}/notes")
    public ResponseEntity<?> saveNote(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        User user = opt.get();
        if (body.containsKey("notes")) {
            user.setNotes(body.get("notes"));
            userRepository.save(user);
        }
        return ResponseEntity.ok(Map.of("message", "Notes saved successfully."));
    }

    @GetMapping("/interviews")
    public List<Map<String, Object>> getInterviews() {
        List<User> candidates = userRepository.findByRoleName("ROLE_CANDIDATE");
        List<Map<String, Object>> result = new ArrayList<>();
        for (User c : candidates) {
            String status = c.getStatus();
            if ("Applied".equalsIgnoreCase(status) || "Interviewing".equalsIgnoreCase(status)) {
                Map<String, Object> m = new HashMap<>();
                m.put("id", c.getId());
                m.put("candidate", c.getName());
                m.put("role", c.getDepartment() != null ? c.getDepartment() : "General Application");
                m.put("time", "10:00 AM"); // Placeholder for scheduled interviews
                m.put("date", "TBD");
                m.put("type", "Technical");
                m.put("status", status != null ? status : "Applied");
                result.add(m);
            }
        }
        return result;
    }

    /**
     * POST /api/manager/hire/{candidateId}
     * Converts a candidate → employee under the hiring manager.
     */
    @PostMapping("/hire/{candidateId}")
    public ResponseEntity<?> hireCandidate(@PathVariable Long candidateId, Authentication auth) {
        // Get hiring manager
        String email = auth != null ? auth.getName() : null;
        if (email == null) return ResponseEntity.status(401).build();
        Optional<User> managerOpt = userRepository.findByEmail(email);
        if (managerOpt.isEmpty()) return ResponseEntity.status(401).build();
        User manager = managerOpt.get();

        // Get candidate
        Optional<User> candidateOpt = userRepository.findById(candidateId);
        if (candidateOpt.isEmpty()) return ResponseEntity.notFound().build();
        User candidate = candidateOpt.get();

        // Convert role: ROLE_CANDIDATE → ROLE_EMPLOYEE
        // In a real app, we'd use roleRepository.findByName("ROLE_EMPLOYEE")
        Role employeeRole = roleRepository.findByName("ROLE_EMPLOYEE")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_EMPLOYEE")));
        
        candidate.setRole(employeeRole);
        candidate.setStatus("Active");
        candidate.setManager(manager);
        // Copy department from manager if candidate doesn't have one
        if (candidate.getDepartment() == null || "N/A".equals(candidate.getDepartment())) {
            candidate.setDepartment(manager.getDepartment());
        }
        userRepository.save(candidate);

        return ResponseEntity.ok(Map.of(
            "message", candidate.getName() + " has been hired as an employee.",
            "employeeId", candidate.getId(),
            "employeeName", candidate.getName()
        ));
    }

    // ── Notes ────────────────────────────────────────────────────────────────

    @GetMapping("/notes")
    public ResponseEntity<Map<String, String>> getNotes() {
        User manager = currentUser();
        if (manager == null)
            return ResponseEntity.status(401).build();
        String notes = manager.getNotes();
        return ResponseEntity.ok(Map.of("notes", notes != null ? notes : ""));
    }

    @PostMapping("/notes")
    public ResponseEntity<Map<String, String>> saveNotes(@RequestBody Map<String, String> body) {
        User manager = currentUser();
        if (manager == null)
            return ResponseEntity.status(401).build();

        String notes = body.getOrDefault("notes", "");
        manager.setNotes(notes);
        userRepository.save(manager);

        return ResponseEntity.ok(Map.of("message", "Notes saved successfully", "notes", notes));
    }
}