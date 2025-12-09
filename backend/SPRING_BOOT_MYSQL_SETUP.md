# Spring Boot MySQL Database Setup Guide

## Overview
This guide covers complete setup of MySQL database connectivity with Spring Boot for the Student Result Management System.

---

## Part 1: Prerequisites

### Required Software
1. **MySQL Server** (v5.7 or higher)
2. **Java JDK** (v11 or higher)
3. **Spring Boot** (v2.7+ or v3.0+)
4. **Maven** or **Gradle** (Build tools)
5. **IDE** (IntelliJ IDEA, Eclipse, VS Code)

### Installation Steps

#### Windows
```bash
# Install MySQL
# Download from https://dev.mysql.com/downloads/mysql/
# Run installer and set root password

# Install Java
# Download JDK from https://www.oracle.com/java/technologies/downloads/

# Install Maven
# Download from https://maven.apache.org/download.cgi
# Add to system PATH
```

#### Linux/Mac
```bash
# macOS - Using Homebrew
brew install mysql
brew install openjdk@11
brew install maven

# Linux - Ubuntu/Debian
sudo apt-get update
sudo apt-get install mysql-server
sudo apt-get install openjdk-11-jdk
sudo apt-get install maven
```

---

## Part 2: Database Setup in MySQL

### Step 1: Create Database and User

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database for Student Management System
CREATE DATABASE student_result_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create dedicated user with privileges
CREATE USER 'student_user'@'localhost' IDENTIFIED BY 'secure_password_123';

-- Grant all privileges to the new user
GRANT ALL PRIVILEGES ON student_result_db.* TO 'student_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify
USE student_result_db;
SHOW TABLES;
```

### Step 2: Create Database Tables

```sql
USE student_result_db;

-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Students Table
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    contact_number VARCHAR(15),
    address TEXT,
    enrollment_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_roll_no (roll_no),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Teachers Table
CREATE TABLE teachers (
    teacher_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(15),
    department VARCHAR(100),
    specialization VARCHAR(100),
    joining_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Subjects Table
CREATE TABLE subjects (
    subject_id INT PRIMARY KEY AUTO_INCREMENT,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    subject_description TEXT,
    credits INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_subject_code (subject_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Classes Table
CREATE TABLE classes (
    class_id INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(100) NOT NULL,
    class_code VARCHAR(50) UNIQUE NOT NULL,
    semester INT,
    academic_year VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_class_code (class_code),
    INDEX idx_semester (semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Class-Subject-Teacher Mapping
CREATE TABLE class_subject_teacher (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    semester INT,
    academic_year VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (class_id, subject_id, teacher_id, semester, academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Student Enrollment Table
CREATE TABLE student_enrollment (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    semester INT,
    academic_year VARCHAR(20),
    enrollment_status ENUM('ACTIVE', 'INACTIVE', 'WITHDRAWN') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, class_id, semester, academic_year),
    INDEX idx_student (student_id),
    INDEX idx_class (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Marks Table
CREATE TABLE marks (
    mark_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    internal_marks DECIMAL(5, 2),
    external_marks DECIMAL(5, 2),
    total_marks DECIMAL(5, 2),
    grade VARCHAR(5),
    grade_point DECIMAL(3, 2),
    semester INT,
    academic_year VARCHAR(20),
    is_published BOOLEAN DEFAULT FALSE,
    published_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    UNIQUE KEY unique_marks (student_id, subject_id, class_id, semester, academic_year),
    INDEX idx_student (student_id),
    INDEX idx_subject (subject_id),
    INDEX idx_semester (semester, academic_year),
    INDEX idx_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recheck Requests Table
CREATE TABLE recheck_requests (
    recheck_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    mark_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    reason TEXT NOT NULL,
    current_marks DECIMAL(5, 2),
    rechecked_marks DECIMAL(5, 2),
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') DEFAULT 'PENDING',
    remarks TEXT,
    requested_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_date TIMESTAMP,
    completed_date TIMESTAMP,
    reviewed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (mark_id) REFERENCES marks(mark_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_status (status),
    INDEX idx_mark (mark_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications Table
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('RECHECK_STATUS', 'MARKS_PUBLISHED', 'SYSTEM_ALERT', 'GENERAL') DEFAULT 'GENERAL',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Audit Logs Table
CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_timestamp (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verify tables
SHOW TABLES;
DESC users;
```

---

## Part 3: Spring Boot Project Setup

### Step 1: Create Spring Boot Project

Using Spring Initializr (https://start.spring.io/):

```
Project: Maven
Language: Java
Spring Boot: 2.7.x or 3.0.x
Group: com.studentresult
Artifact: student-result-management
Package: com.studentresult.app
```

**Or via command line:**
```bash
mvn archetype:generate \
  -DgroupId=com.studentresult \
  -DartifactId=student-result-management \
  -DarchetypeArtifactId=maven-archetype-quickstart
```

### Step 2: Update pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.15</version>
        <relativePath/>
    </parent>

    <groupId>com.studentresult</groupId>
    <artifactId>student-result-management</artifactId>
    <version>1.0.0</version>
    <name>Student Result Management System</name>

    <properties>
        <java.version>11</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- MySQL Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>

        <!-- Lombok for reducing boilerplate -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- JWT for authentication -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>

        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Swagger/Springdoc OpenAPI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-ui</artifactId>
            <version>1.7.0</version>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### Step 3: Configure application.properties

Create `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/api

# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/student_result_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=student_user
spring.datasource.password=secure_password_123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.batch_size=10
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true

# Connection Pool Configuration (HikariCP)
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# Logging
logging.level.root=INFO
logging.level.com.studentresult=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# JWT Configuration
jwt.secret=your_secret_key_here_make_it_long_and_secure
jwt.expiration=86400000

# Application Name
spring.application.name=Student Result Management System
```

**Or using application.yml:**

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  application:
    name: Student Result Management System
  
  datasource:
    url: jdbc:mysql://localhost:3306/student_result_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: student_user
    password: secure_password_123
    driver-class-name: com.mysql.cj.jdbc.Driver
    
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  
  jpa:
    database-platform: org.hibernate.dialect.MySQL8Dialect
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        jdbc:
          batch_size: 10
        order_inserts: true
        order_updates: true

logging:
  level:
    root: INFO
    com.studentresult: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE

jwt:
  secret: your_secret_key_here_make_it_long_and_secure
  expiration: 86400000
```

---

## Part 4: Create Entity Classes

### Step 1: User Entity

Create `src/main/java/com/studentresult/app/entity/User.java`:

```java
package com.studentresult.app.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum UserRole {
        ADMIN, TEACHER, STUDENT
    }
}
```

### Step 2: Student Entity

Create `src/main/java/com/studentresult/app/entity/Student.java`:

```java
package com.studentresult.app.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students", indexes = {
    @Index(name = "idx_roll_no", columnList = "roll_no"),
    @Index(name = "idx_user_id", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer studentId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, unique = true)
    private String rollNo;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column
    private LocalDate dateOfBirth;
    
    @Column
    private String contactNumber;
    
    @Column
    private String address;
    
    @Column(nullable = false)
    private LocalDate enrollmentDate;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
```

### Step 3: Subject Entity

Create `src/main/java/com/studentresult/app/entity/Subject.java`:

```java
package com.studentresult.app.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subjects", indexes = {
    @Index(name = "idx_subject_code", columnList = "subject_code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subject {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer subjectId;
    
    @Column(nullable = false, unique = true)
    private String subjectCode;
    
    @Column(nullable = false)
    private String subjectName;
    
    @Column
    private String subjectDescription;
    
    @Column
    private Integer credits;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### Step 4: Marks Entity

Create `src/main/java/com/studentresult/app/entity/Marks.java`:

```java
package com.studentresult.app.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marks", indexes = {
    @Index(name = "idx_student", columnList = "student_id"),
    @Index(name = "idx_subject", columnList = "subject_id"),
    @Index(name = "idx_semester", columnList = "semester,academic_year"),
    @Index(name = "idx_published", columnList = "is_published")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Marks {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer markId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
    
    @Column
    private BigDecimal internalMarks;
    
    @Column
    private BigDecimal externalMarks;
    
    @Column
    private BigDecimal totalMarks;
    
    @Column
    private String grade;
    
    @Column
    private BigDecimal gradePoint;
    
    @Column(nullable = false)
    private Integer semester;
    
    @Column(nullable = false)
    private String academicYear;
    
    @Column(nullable = false)
    private Boolean isPublished = false;
    
    @Column
    private LocalDateTime publishedDate;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

## Part 5: Create Repository Interfaces

### Step 1: User Repository

Create `src/main/java/com/studentresult/app/repository/UserRepository.java`:

```java
package com.studentresult.app.repository;

import com.studentresult.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndIsActiveTrue(String email);
}
```

### Step 2: Student Repository

Create `src/main/java/com/studentresult/app/repository/StudentRepository.java`:

```java
package com.studentresult.app.repository;

import com.studentresult.app.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    Optional<Student> findByRollNo(String rollNo);
    Optional<Student> findByUserId(Integer userId);
}
```

### Step 3: Subject Repository

Create `src/main/java/com/studentresult/app/repository/SubjectRepository.java`:

```java
package com.studentresult.app.repository;

import com.studentresult.app.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    Optional<Subject> findBySubjectCode(String subjectCode);
}
```

### Step 4: Marks Repository

Create `src/main/java/com/studentresult/app/repository/MarksRepository.java`:

```java
package com.studentresult.app.repository;

import com.studentresult.app.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Integer> {
    List<Marks> findByStudentStudentIdAndSemesterAndAcademicYear(
        Integer studentId, Integer semester, String academicYear);
    
    List<Marks> findByStudentStudentId(Integer studentId);
    
    Optional<Marks> findByStudentStudentIdAndSubjectSubjectIdAndSemesterAndAcademicYear(
        Integer studentId, Integer subjectId, Integer semester, String academicYear);
}
```

---

## Part 6: Create Service Layer

### Step 1: User Service

Create `src/main/java/com/studentresult/app/service/UserService.java`:

```java
package com.studentresult.app.service;

import com.studentresult.app.entity.User;
import com.studentresult.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public User createUser(String email, String password, User.UserRole role) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setIsActive(true);
        return userRepository.save(user);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public User updateUser(Integer userId, User user) {
        return userRepository.findById(userId)
            .map(existingUser -> {
                existingUser.setEmail(user.getEmail());
                existingUser.setIsActive(user.getIsActive());
                return userRepository.save(existingUser);
            })
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public boolean validatePassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }
}
```

### Step 2: Student Service

Create `src/main/java/com/studentresult/app/service/StudentService.java`:

```java
package com.studentresult.app.service;

import com.studentresult.app.entity.Student;
import com.studentresult.app.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class StudentService {
    
    private final StudentRepository studentRepository;
    
    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }
    
    public Optional<Student> getStudentById(Integer studentId) {
        return studentRepository.findById(studentId);
    }
    
    public Optional<Student> getStudentByRollNo(String rollNo) {
        return studentRepository.findByRollNo(rollNo);
    }
    
    public Optional<Student> getStudentByUserId(Integer userId) {
        return studentRepository.findByUserId(userId);
    }
    
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
    
    public Student updateStudent(Integer studentId, Student studentDetails) {
        return studentRepository.findById(studentId)
            .map(student -> {
                student.setFirstName(studentDetails.getFirstName());
                student.setLastName(studentDetails.getLastName());
                student.setContactNumber(studentDetails.getContactNumber());
                student.setAddress(studentDetails.getAddress());
                return studentRepository.save(student);
            })
            .orElseThrow(() -> new RuntimeException("Student not found"));
    }
    
    public void deleteStudent(Integer studentId) {
        studentRepository.deleteById(studentId);
    }
}
```

### Step 3: Marks Service

Create `src/main/java/com/studentresult/app/service/MarksService.java`:

```java
package com.studentresult.app.service;

import com.studentresult.app.entity.Marks;
import com.studentresult.app.repository.MarksRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class MarksService {
    
    private final MarksRepository marksRepository;
    
    public Marks createMarks(Marks marks) {
        return marksRepository.save(marks);
    }
    
    public List<Marks> getMarksForStudent(Integer studentId) {
        return marksRepository.findByStudentStudentId(studentId);
    }
    
    public List<Marks> getMarksForSemester(Integer studentId, Integer semester, String academicYear) {
        return marksRepository.findByStudentStudentIdAndSemesterAndAcademicYear(
            studentId, semester, academicYear);
    }
    
    public Optional<Marks> getMarkById(Integer markId) {
        return marksRepository.findById(markId);
    }
    
    public Marks updateMarks(Integer markId, Marks marksDetails) {
        return marksRepository.findById(markId)
            .map(marks -> {
                marks.setInternalMarks(marksDetails.getInternalMarks());
                marks.setExternalMarks(marksDetails.getExternalMarks());
                marks.setTotalMarks(marksDetails.getTotalMarks());
                marks.setGrade(calculateGrade(marksDetails.getTotalMarks()));
                marks.setGradePoint(calculateGradePoint(marksDetails.getGrade()));
                return marksRepository.save(marks);
            })
            .orElseThrow(() -> new RuntimeException("Marks not found"));
    }
    
    public Marks publishMarks(Integer markId) {
        return marksRepository.findById(markId)
            .map(marks -> {
                marks.setIsPublished(true);
                marks.setPublishedDate(LocalDateTime.now());
                return marksRepository.save(marks);
            })
            .orElseThrow(() -> new RuntimeException("Marks not found"));
    }
    
    public String calculateGrade(BigDecimal marks) {
        if (marks == null) return null;
        int marksInt = marks.intValue();
        if (marksInt >= 90) return "A+";
        if (marksInt >= 80) return "A";
        if (marksInt >= 70) return "B+";
        if (marksInt >= 60) return "B";
        if (marksInt >= 50) return "C";
        if (marksInt >= 40) return "D";
        return "F";
    }
    
    public BigDecimal calculateGradePoint(String grade) {
        if (grade == null) return BigDecimal.ZERO;
        switch(grade) {
            case "A+": return new BigDecimal("4.0");
            case "A": return new BigDecimal("4.0");
            case "B+": return new BigDecimal("3.5");
            case "B": return new BigDecimal("3.0");
            case "C": return new BigDecimal("2.0");
            case "D": return new BigDecimal("1.0");
            default: return BigDecimal.ZERO;
        }
    }
    
    public BigDecimal calculateGPA(List<Marks> marks) {
        if (marks.isEmpty()) return BigDecimal.ZERO;
        BigDecimal totalGP = marks.stream()
            .map(Marks::getGradePoint)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalGP.divide(new BigDecimal(marks.size()), 2, BigDecimal.ROUND_HALF_UP);
    }
}
```

---

## Part 7: Create Controller

### Marks Controller Example

Create `src/main/java/com/studentresult/app/controller/MarksController.java`:

```java
package com.studentresult.app.controller;

import com.studentresult.app.entity.Marks;
import com.studentresult.app.service.MarksService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/marks")
@RequiredArgsConstructor
public class MarksController {
    
    private final MarksService marksService;
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Marks>> getStudentMarks(@PathVariable Integer studentId) {
        List<Marks> marks = marksService.getMarksForStudent(studentId);
        return ResponseEntity.ok(marks);
    }
    
    @GetMapping("/student/{studentId}/semester/{semester}/year/{academicYear}")
    public ResponseEntity<List<Marks>> getSemesterMarks(
            @PathVariable Integer studentId,
            @PathVariable Integer semester,
            @PathVariable String academicYear) {
        List<Marks> marks = marksService.getMarksForSemester(studentId, semester, academicYear);
        return ResponseEntity.ok(marks);
    }
    
    @GetMapping("/{markId}")
    public ResponseEntity<Marks> getMarkById(@PathVariable Integer markId) {
        return marksService.getMarkById(markId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Marks> createMarks(@RequestBody Marks marks) {
        Marks created = marksService.createMarks(marks);
        return ResponseEntity.ok(created);
    }
    
    @PutMapping("/{markId}")
    public ResponseEntity<Marks> updateMarks(
            @PathVariable Integer markId,
            @RequestBody Marks marks) {
        Marks updated = marksService.updateMarks(markId, marks);
        return ResponseEntity.ok(updated);
    }
    
    @PostMapping("/{markId}/publish")
    public ResponseEntity<Marks> publishMarks(@PathVariable Integer markId) {
        Marks published = marksService.publishMarks(markId);
        return ResponseEntity.ok(published);
    }
}
```

---

## Part 8: Running the Application

### Step 1: Verify MySQL is Running
```bash
# Linux/Mac
mysql -u root -p

# Windows (MySQL Command Line)
mysql -u student_user -p -h localhost
```

### Step 2: Build the Project
```bash
cd student-result-management
mvn clean install
```

### Step 3: Run the Application
```bash
# Using Maven
mvn spring-boot:run

# Or using Java
java -jar target/student-result-management-1.0.0.jar
```

### Step 4: Test the Connection
```bash
# Check if server is running
curl http://localhost:8080/api/marks

# Should return data or appropriate response
```

---

## Part 9: Connection Pool Configuration (HikariCP)

HikariCP is included by default. Configuration in `application.properties`:

```properties
# HikariCP Configuration
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.auto-commit=true
```

**Key Parameters:**
- `maximum-pool-size`: Max connections in pool (default: 10)
- `minimum-idle`: Min idle connections (default: 5)
- `connection-timeout`: Time to wait for connection (ms)
- `idle-timeout`: Max idle time before closing (ms)
- `max-lifetime`: Max connection lifetime (ms)

---

## Part 10: Troubleshooting

### Issue 1: Connection Refused
```
Error: Connection refused: connect
```

**Solution:**
```bash
# Check MySQL is running
systemctl status mysql  # Linux
brew services list     # Mac
sc query MySQL80       # Windows

# Verify connection string
spring.datasource.url=jdbc:mysql://localhost:3306/student_result_db
```

### Issue 2: Access Denied
```
Error: Access denied for user 'student_user'@'localhost'
```

**Solution:**
```sql
-- Reset password
ALTER USER 'student_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;

-- Update in application.properties
spring.datasource.password=new_password
```

### Issue 3: Database Not Found
```
Error: Unknown database 'student_result_db'
```

**Solution:**
```sql
-- Create database again
CREATE DATABASE student_result_db;

-- Verify
SHOW DATABASES;
```

### Issue 4: Port Already in Use
```
Error: Port 8080 is already in use
```

**Solution:**
```properties
# Change port in application.properties
server.port=8081
```

### Issue 5: Connection Pool Exhausted
```
Error: HikariPool - Connection is not available
```

**Solution:**
```properties
# Increase pool size
spring.datasource.hikari.maximum-pool-size=20

# Or close connections properly in code
@Transactional  # Use this on service methods
```

---

## Part 11: Best Practices

### 1. Use Transactions
```java
@Service
@Transactional
public class UserService {
    // All methods are transactional
}
```

### 2. Use DTOs for API
```java
public class StudentDTO {
    private Integer studentId;
    private String rollNo;
    private String fullName;
    // Getters and Setters
}
```

### 3. Add Validation
```java
@PostMapping
public ResponseEntity<Student> createStudent(
    @Valid @RequestBody StudentDTO studentDTO) {
    // Validation automatically applied
}
```

### 4. Add Logging
```java
private static final Logger logger = LoggerFactory.getLogger(StudentService.class);

public Student createStudent(Student student) {
    logger.info("Creating student with roll no: {}", student.getRollNo());
    return studentRepository.save(student);
}
```

### 5. Handle Exceptions
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }
}
```

---

## Conclusion

You now have a complete Spring Boot + MySQL setup for the Student Result Management System with:

✅ Database created and configured  
✅ Connection pooling configured  
✅ JPA entities defined  
✅ Repositories created  
✅ Services implemented  
✅ Controllers ready  
✅ Ready for authentication and business logic  

Next steps:
1. Implement all remaining entities (Teacher, Class, etc.)
2. Add authentication (JWT)
3. Implement business logic
4. Add validation and error handling
5. Write unit tests
