# Database Architecture Documentation - Precision ATS

This document provides a detailed overview of the database design, entity relationships, and the implementation of advanced database features like triggers and JOINs within the Precision ATS project.

## Entity-Relationship Diagram
<img width="6389" height="5570" alt="User Management and Skills-2026-04-05-140614" src="https://github.com/user-attachments/assets/cb43f0aa-709c-4754-9afe-f3bad57149cb" />

## Core Tables

1.  **`roles`**: Defines system authorization levels (e.g., ADMIN, MANAGER, EMPLOYEE).
2.  **`users`**: Central table for all personnel. Includes self-referencing `manager_id` for organizational hierarchy and a link to `roles`.
3.  **`skills` & `user_skills`**: Implements a Many-to-Many relationship between users and skills, including metadata like proficiency and experience.
4.  **`jobs`**: Stores job requisitions created by managers.
5.  **`applications`**: Tracks the link between a user and a job they've applied for, along with the application status.
6.  **`audit_logs`**: A generic table used by triggers to track changes across sensitive tables.

---

## Usage of Database Triggers

Triggers are used to automate **Audit Logging** directly at the database level. This ensures that every INSERT or UPDATE action is recorded, regardless of whether it originated from the backend application or a direct DB tool.

### Example: User Audit Trigger
When a new user is added or updated, a record is automatically inserted into `audit_logs`.

```sql
-- Trigger for new user insertion
CREATE TRIGGER trg_user_insert AFTER INSERT ON users
FOR EACH ROW INSERT INTO audit_logs (table_name, record_id, action, details, timestamp)
VALUES ('users', NEW.id, 'INSERT', CONCAT('User created: ', NEW.name, ' (', NEW.email, ')'), NOW());
```

---

## Usage of SQL JOINs

The application utilizes JOINS both via JPA (Java Persistence API) and custom SQL queries to aggregate data from multiple tables.

### 1. JPA Implicit Joins
In the `User` entity, `@ManyToOne` relationships automatically trigger JOINS when fetching data.
*   **User to Role**: Managed by `@ManyToOne(fetch = FetchType.EAGER)`. Every time a user is loaded, their role is joined.
*   **Self-Join (Manager)**: A `User` can reference another `User` as their manager, creating an internal hierarchy join.

### 2. Custom Query Joins (Repository Layer)
In `UserRepository.java`, explicit JOINS are used in `@Query` annotations to filter data based on related entities.

**Example: Finding users by Role Name**
```java
@Query("SELECT u FROM User u JOIN u.role r WHERE r.name = :roleName")
List<User> findByRoleName(String roleName);
```
*   **How it works**: This JPQL query joins the `users` table with the `roles` table on the `role_id` foreign key. It filters the result set where the `name` column in the `roles` table matches the provided parameter.

---

## Summary of Relationships
- **One-to-Many**: `User` -> `LeaveRequest`, `PerformanceReview`, `Certification`.
- **Many-to-One**: `User` -> `Role`, `User` -> `Manager (User)`.
- **Many-to-Many**: `User` <-> `Skill` (via `user_skills`).
