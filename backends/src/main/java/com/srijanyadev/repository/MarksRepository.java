package com.srijanyadev.repository;

import com.srijanyadev.entity.Marks;
import com.srijanyadev.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudent(Student student);
    List<Marks> findByStudentAndIsActiveTrue(Student student);
    List<Marks> findBySubject(String subject);
    List<Marks> findByYear(Integer year);
    List<Marks> findByTerm(String term);
}
