CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    manager_id BIGINT,
    department VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active',
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_skills (
    user_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency_level INT NOT NULL,
    years_experience INT NOT NULL,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(255),
    location VARCHAR(255),
    type VARCHAR(50) DEFAULT 'Full-time',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    posted_date DATE
);

CREATE TABLE IF NOT EXISTS applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    applied_date DATE,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Triggers for users
DROP TRIGGER IF EXISTS trg_user_insert;
CREATE TRIGGER trg_user_insert AFTER INSERT ON users
FOR EACH ROW INSERT INTO audit_logs (table_name, record_id, action, details, timestamp)
VALUES ('users', NEW.id, 'INSERT', CONCAT('User created: ', NEW.name, ' (', NEW.email, ')'), NOW());

DROP TRIGGER IF EXISTS trg_user_update;
CREATE TRIGGER trg_user_update AFTER UPDATE ON users
FOR EACH ROW INSERT INTO audit_logs (table_name, record_id, action, details, timestamp)
VALUES ('users', NEW.id, 'UPDATE', CONCAT('User updated: ', NEW.name, '. Status: ', NEW.status), NOW());

-- Triggers for jobs
DROP TRIGGER IF EXISTS trg_job_insert;
CREATE TRIGGER trg_job_insert AFTER INSERT ON jobs
FOR EACH ROW INSERT INTO audit_logs (table_name, record_id, action, details, timestamp)
VALUES ('jobs', NEW.id, 'INSERT', CONCAT('Job requisition created: ', NEW.title), NOW());

-- Triggers for applications
DROP TRIGGER IF EXISTS trg_application_insert;
CREATE TRIGGER trg_application_insert AFTER INSERT ON applications
FOR EACH ROW INSERT INTO audit_logs (table_name, record_id, action, details, timestamp)
VALUES ('applications', NEW.id, 'INSERT', CONCAT('New application for Job ID ', NEW.job_id, ' by User ID ', NEW.user_id), NOW());

DROP TRIGGER IF EXISTS trg_application_update;
CREATE TRIGGER trg_application_update AFTER UPDATE ON applications
FOR EACH ROW INSERT INTO audit_logs (table_name, record_id, action, details, timestamp)
VALUES ('applications', NEW.id, 'UPDATE', CONCAT('Application status changed from ', OLD.status, ' to ', NEW.status), NOW());
