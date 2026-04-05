package com.precision.ats.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void seed() {
        seedRoles();
        seedUsers();
        seedSkills();
        seedUserSkills();
        seedJobs();
        seedApplications();
        seedHRData();
    }

    private void upsert(String sql) {
        jdbcTemplate.update(sql);
    }

    private void seedRoles() {
        upsert("INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN') ON DUPLICATE KEY UPDATE name=VALUES(name)");
        upsert("INSERT INTO roles (id, name) VALUES (2, 'ROLE_MANAGER') ON DUPLICATE KEY UPDATE name=VALUES(name)");
        upsert("INSERT INTO roles (id, name) VALUES (3, 'ROLE_EMPLOYEE') ON DUPLICATE KEY UPDATE name=VALUES(name)");
        upsert("INSERT INTO roles (id, name) VALUES (4, 'ROLE_CANDIDATE') ON DUPLICATE KEY UPDATE name=VALUES(name)");
    }

    private void seedUsers() {
        upsert("INSERT INTO users (id, name, email, password, role_id, manager_id, department, location, status) VALUES (1, 'Chirag Boliwal', 'admin@precision.com', 'admin123', 1, NULL, 'IT Administration', 'Bangalore, IN', 'Active') ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password=VALUES(password), role_id=VALUES(role_id), department=VALUES(department), location=VALUES(location), status=VALUES(status)");
        upsert("INSERT INTO users (id, name, email, password, role_id, manager_id, department, location, status) VALUES (2, 'Priya Sharma', 'manager.eng@precision.com', 'manager123', 2, 1, 'Engineering', 'Bangalore, IN', 'Active') ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password=VALUES(password), role_id=VALUES(role_id), department=VALUES(department), location=VALUES(location), status=VALUES(status)");
        upsert("INSERT INTO users (id, name, email, password, role_id, manager_id, department, location, status) VALUES (3, 'Anjali Verma', 'anjali@precision.com', 'employee123', 3, 2, 'Engineering', 'Remote', 'Active') ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password=VALUES(password), role_id=VALUES(role_id), department=VALUES(department), location=VALUES(location), status=VALUES(status)");
        upsert("INSERT INTO users (id, name, email, password, role_id, manager_id, department, location, status) VALUES (4, 'Rahul Kapoor', 'rahul@precision.com', 'employee123', 3, 2, 'Engineering', 'Hyderabad, IN', 'Active') ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password=VALUES(password), role_id=VALUES(role_id), department=VALUES(department), location=VALUES(location), status=VALUES(status)");
        upsert("INSERT INTO users (id, name, email, password, role_id, manager_id, department, location, status) VALUES (5, 'Sneha Patel', 'sneha@precision.com', 'employee123', 3, 2, 'Design', 'Mumbai, IN', 'Active') ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password=VALUES(password), role_id=VALUES(role_id), department=VALUES(department), location=VALUES(location), status=VALUES(status)");
        upsert("INSERT INTO users (id, name, email, password, role_id, manager_id, department, location, status) VALUES (6, 'Rohan Gupta', 'rohan@precision.com', 'employee123', 3, 2, 'Engineering', 'Remote', 'Active') ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password=VALUES(password), role_id=VALUES(role_id), department=VALUES(department), location=VALUES(location), status=VALUES(status)");
        upsert("INSERT INTO users (id, name, email, password, role_id, manager_id, department, location, status) VALUES (7, 'Arjun Applicant', 'arjun.app@precision.com', 'candidate123', 4, NULL, 'N/A', 'Remote', 'Interviewing') ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password=VALUES(password), role_id=VALUES(role_id), status=VALUES(status)");
    }

    private void seedSkills() {
        upsert("INSERT INTO skills (id, name, category) VALUES (1, 'Java', 'Backend') ON DUPLICATE KEY UPDATE name=VALUES(name)");
        upsert("INSERT INTO skills (id, name, category) VALUES (2, 'Spring Boot', 'Backend') ON DUPLICATE KEY UPDATE name=VALUES(name)");
        upsert("INSERT INTO skills (id, name, category) VALUES (3, 'React', 'Frontend') ON DUPLICATE KEY UPDATE name=VALUES(name)");
        upsert("INSERT INTO skills (id, name, category) VALUES (4, 'TypeScript', 'Frontend') ON DUPLICATE KEY UPDATE name=VALUES(name)");
        upsert("INSERT INTO skills (id, name, category) VALUES (5, 'Figma', 'Design') ON DUPLICATE KEY UPDATE name=VALUES(name)");
        upsert("INSERT INTO skills (id, name, category) VALUES (6, 'UI/UX Research', 'Design') ON DUPLICATE KEY UPDATE name=VALUES(name)");
        upsert("INSERT INTO skills (id, name, category) VALUES (7, 'MySQL', 'Database') ON DUPLICATE KEY UPDATE name=VALUES(name)");
        upsert("INSERT INTO skills (id, name, category) VALUES (8, 'AWS', 'DevOps') ON DUPLICATE KEY UPDATE name=VALUES(name)");
    }

    private void seedUserSkills() {
        jdbcTemplate.update("INSERT IGNORE INTO user_skills (user_id, skill_id, proficiency_level, years_experience) VALUES (3, 3, 5, 4)");
        jdbcTemplate.update("INSERT IGNORE INTO user_skills (user_id, skill_id, proficiency_level, years_experience) VALUES (4, 1, 5, 6)");
        jdbcTemplate.update("INSERT IGNORE INTO user_skills (user_id, skill_id, proficiency_level, years_experience) VALUES (5, 5, 5, 5)");
        jdbcTemplate.update("INSERT IGNORE INTO user_skills (user_id, skill_id, proficiency_level, years_experience) VALUES (6, 1, 4, 3)");
        jdbcTemplate.update("INSERT IGNORE INTO user_skills (user_id, skill_id, proficiency_level, years_experience) VALUES (7, 1, 4, 2)");
    }

    private void seedJobs() {
        upsert("INSERT INTO jobs (id, title, description, department, location, type, status, posted_date) VALUES (1, 'Senior Backend Engineer', 'Looking for an experienced Java developer.', 'Engineering', 'Remote', 'Full-time', 'OPEN', '2026-03-20') ON DUPLICATE KEY UPDATE title=VALUES(title)");
        upsert("INSERT INTO jobs (id, title, description, department, location, type, status, posted_date) VALUES (2, 'Senior Product Designer', 'Lead the design system.', 'Design', 'San Francisco, CA', 'Full-time', 'OPEN', '2026-03-25') ON DUPLICATE KEY UPDATE title=VALUES(title)");
        upsert("INSERT INTO jobs (id, title, description, department, location, type, status, posted_date) VALUES (3, 'DevOps Engineer', 'Own CI/CD pipelines on AWS.', 'Infrastructure', 'Remote', 'Full-time', 'OPEN', '2026-04-01') ON DUPLICATE KEY UPDATE title=VALUES(title)");
        upsert("INSERT INTO jobs (id, title, description, department, location, type, status, posted_date) VALUES (4, 'React Frontend Developer', 'Build and maintain React apps.', 'Engineering', 'Bangalore, IN', 'Full-time', 'OPEN', '2026-04-02') ON DUPLICATE KEY UPDATE title=VALUES(title)");
        upsert("INSERT INTO jobs (id, title, description, department, location, type, status, posted_date) VALUES (5, 'Product Manager', 'Drive product strategy.', 'Product', 'Mumbai, IN', 'Full-time', 'CLOSED', '2026-03-10') ON DUPLICATE KEY UPDATE title=VALUES(title)");
    }

    private void seedApplications() {
        jdbcTemplate.update("INSERT IGNORE INTO applications (id, job_id, user_id, status) VALUES (1, 1, 7, 'INTERVIEWING')");
    }

    private void seedHRData() {
        jdbcTemplate.update("INSERT IGNORE INTO leave_requests (id, user_id, type, dates, status) VALUES (1, 3, 'Vacation', 'May 10 - May 14', 'Approved')");
        jdbcTemplate.update("INSERT IGNORE INTO performance_reviews (id, user_id, period, rating, feedback) VALUES (1, 3, 'Q1 2026', 'Meets Expectations', 'Good technical progress.')");
        jdbcTemplate.update("INSERT IGNORE INTO certifications (id, user_id, name, issue_date) VALUES (1, 3, 'AWS Certified Developer', 'Feb 2025')");
        
        jdbcTemplate.update("INSERT IGNORE INTO leave_requests (id, user_id, type, dates, status) VALUES (2, 5, 'Sick Leave', 'April 1 - April 2', 'Approved')");
        jdbcTemplate.update("INSERT IGNORE INTO performance_reviews (id, user_id, period, rating, feedback) VALUES (2, 5, 'Q4 2025', 'Exceeds Expectations', 'Led the system redesign.')");
        jdbcTemplate.update("INSERT IGNORE INTO certifications (id, user_id, name, issue_date) VALUES (2, 5, 'Google UX Design', 'June 2024')");
    }
}
