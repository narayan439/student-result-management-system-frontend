# Student Result Management System - Spring Boot Backend

Complete REST API backend for the Student Result Management System using Spring Boot, MySQL, and JPA.

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/srijanyadev/
│   │   │   ├── StudentResultManagementApplication.java (Main Application Class)
│   │   │   ├── controller/
│   │   │   │   ├── StudentController.java
│   │   │   │   ├── MarksController.java
│   │   │   │   └── RecheckRequestController.java
│   │   │   ├── service/
│   │   │   │   ├── StudentService.java
│   │   │   │   ├── MarksService.java
│   │   │   │   └── RecheckRequestService.java
│   │   │   ├── repository/
│   │   │   │   ├── StudentRepository.java
│   │   │   │   ├── MarksRepository.java
│   │   │   │   ├── RecheckRequestRepository.java
│   │   │   │   └── UserRepository.java
│   │   │   ├── entity/
│   │   │   │   ├── Student.java
│   │   │   │   ├── Marks.java
│   │   │   │   ├── RecheckRequest.java
│   │   │   │   └── User.java
│   │   │   └── dto/
│   │   │       ├── StudentDTO.java
│   │   │       ├── MarksDTO.java
│   │   │       ├── RecheckRequestDTO.java
│   │   │       └── ApiResponse.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

## Prerequisites

- Java 11 or higher
- Maven 3.6.0 or higher
- MySQL 8.0 or higher
- Git

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd student-result-management-system/backend
```

### 2. MySQL Database Setup

Create database and tables:
```sql
CREATE DATABASE student_result_db;
USE student_result_db;
```

Run the SQL schema (automatically created by Hibernate with `ddl-auto=update`).

### 3. Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/student_result_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password

# JWT Configuration
jwt.secret=your_secret_key_change_in_production

# CORS Configuration
cors.allowed-origins=http://localhost:4200,http://localhost:3000
```

### 4. Build the Project

```bash
mvn clean install
```

### 5. Run the Application

```bash
mvn spring-boot:run
```

Or build JAR and run:
```bash
mvn clean package
java -jar target/student-result-backend-1.0.0.jar
```

The application will start on `http://localhost:8080/api`

## API Endpoints

### Students
- `GET /api/students/all` - Get all students
- `GET /api/students/active` - Get active students
- `GET /api/students/{id}` - Get student by ID
- `GET /api/students/email/{email}` - Get student by email
- `GET /api/students/roll/{rollNo}` - Get student by roll number
- `GET /api/students/class/{className}` - Get students by class
- `POST /api/students` - Create new student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Marks
- `GET /api/marks/all` - Get all marks
- `GET /api/marks/student/{studentId}` - Get marks by student
- `GET /api/marks/year/{year}` - Get marks by year
- `GET /api/marks/term/{term}` - Get marks by term
- `POST /api/marks/student/{studentId}` - Create marks
- `PUT /api/marks/{markId}` - Update marks
- `DELETE /api/marks/{markId}` - Delete marks

### Recheck Requests
- `GET /api/recheck-requests/all` - Get all recheck requests
- `GET /api/recheck-requests/student/{studentId}` - Get requests by student
- `GET /api/recheck-requests/status/{status}` - Get requests by status
- `GET /api/recheck-requests/pending` - Get pending requests
- `POST /api/recheck-requests` - Create recheck request
- `PUT /api/recheck-requests/{recheckId}/approve` - Approve request
- `PUT /api/recheck-requests/{recheckId}/reject` - Reject request
- `PUT /api/recheck-requests/{recheckId}/complete` - Complete request

## Database Schema

### Students Table
- student_id (Primary Key)
- name
- email (Unique)
- roll_no (Unique)
- class_name
- date_of_birth
- phone
- address
- is_active
- created_at
- updated_at

### Marks Table
- mark_id (Primary Key)
- student_id (Foreign Key)
- subject
- marks_obtained
- max_marks
- term
- year
- is_active
- created_at
- updated_at

### Recheck Requests Table
- recheck_id (Primary Key)
- student_id (Foreign Key)
- mark_id (Foreign Key)
- reason (TEXT)
- status (pending, approved, rejected, completed)
- remarks (TEXT)
- reviewed_by (Foreign Key to Users)
- reviewed_date
- created_at
- updated_at

### Users Table
- user_id (Primary Key)
- username (Unique)
- email (Unique)
- password
- role (ROLE_STUDENT, ROLE_TEACHER, ROLE_ADMIN)
- student_id (Foreign Key)
- first_name
- last_name
- is_active
- created_at
- updated_at

## Technologies Used

- **Spring Boot 2.7.14** - Framework
- **Spring Data JPA** - Data Access
- **MySQL** - Database
- **Maven** - Build Tool
- **Lombok** - Code Generation
- **Spring Security** - Authentication
- **JWT** - Token-based Authentication
- **Jackson** - JSON Processing

## Configuration

### CORS Configuration
CORS is configured to allow requests from Angular frontend:
- `http://localhost:4200` (Angular development server)
- `http://localhost:3000` (Alternative frontend)

### Logging
- Root Level: INFO
- Application Level: DEBUG
- Spring Web: DEBUG
- Spring Security: DEBUG

## Development

### Adding New Entity
1. Create entity class in `entity/` package
2. Create repository in `repository/` package extending `JpaRepository`
3. Create DTO in `dto/` package
4. Create service in `service/` package
5. Create controller in `controller/` package

### Adding New API Endpoint
1. Add method in repository (if needed)
2. Add method in service
3. Add method in controller
4. Configure CORS and authentication (if needed)

## Testing

Run tests with:
```bash
mvn test
```

## Troubleshooting

### Connection Refused
- Ensure MySQL is running on localhost:3306
- Check database credentials in `application.properties`

### Table Not Found
- Hibernate DDL is set to `update`, tables are created automatically
- Check MySQL connection and database creation

### CORS Issues
- Verify frontend URL is in `cors.allowed-origins`
- Check that credentials are sent with requests (if needed)

## Future Enhancements

- [ ] User authentication and JWT implementation
- [ ] Role-based access control (RBAC)
- [ ] Pagination and sorting for large datasets
- [ ] File upload for student documents
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Batch import/export
- [ ] Audit logging
- [ ] API documentation with Swagger

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please create an issue in the repository or contact the development team.
