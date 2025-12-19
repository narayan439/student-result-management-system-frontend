package com.srijanyadev.repository;

import com.srijanyadev.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);
    Optional<Student> findByRollNo(String rollNo);
    List<Student> findByClassName(String className);
    List<Student> findByIsActiveTrue();
}
