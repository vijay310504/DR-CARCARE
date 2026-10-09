package com.drcarcare.repository;

import com.drcarcare.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TechnicianRepository
        extends JpaRepository<Technician, Long> {

    boolean existsByTechnicianCode(String technicianCode);

    boolean existsByEmail(String email);

    Optional<Technician> findByTechnicianCode(String technicianCode);

    Optional<Technician> findByEmail(String email);

    List<Technician> findByStatus(String status);

    List<Technician> findBySpecializationIgnoreCase(
            String specialization
    );

    List<Technician> findBySkillLevelIgnoreCase(
            String skillLevel
    );
}