package com.precision.ats.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @GetMapping
    public List<Map<String, String>> getJobs() {
        return List.of(
            Map.of("id", "1", "title", "Senior Product Designer", "department", "Design", "location", "San Francisco, CA", "type", "Full-time", "posted", "2 days ago"),
            Map.of("id", "2", "title", "Backend Software Engineer", "department", "Engineering", "location", "Remote", "type", "Full-time", "posted", "1 week ago")
        );
    }
}
