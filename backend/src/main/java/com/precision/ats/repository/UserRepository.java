package com.precision.ats.repository;

import com.precision.ats.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByManagerId(Long managerId);
    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u JOIN u.role r WHERE r.name = :roleName")
    List<User> findByRoleName(String roleName);

    List<User> findByRole(com.precision.ats.models.Role role);
}
