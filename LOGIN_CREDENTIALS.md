# Login Credentials - Student Result Management System

## Updated Authentication System

All users now use the same password: **123456**

---

## Admin Login
- **Email:** admin@gmail.com
- **Password:** 123456
- **Role:** Admin (Full system access)

---

## Teacher Login
Use **any teacher email address** from the system with password **123456**

### Sample Teacher Emails:
- rajesh@school.com
- meera@school.com
- arun@school.com
- deepak@school.com
- priya@school.com
- anish@school.com
- neha@school.com
- vikram@school.com
- shreya@school.com
- arjun@school.com
- pooja@school.com
- manoj@school.com
- isha@school.com
- (and 11+ more teachers available in the system)

**Password:** 123456

---

## Student Login
Use **any student email address** from the system with password **123456**

### Sample Student Emails:
- The system has 200 sample students with emails in format: `firstname.lastname#@student.com`
- Examples:
  - arjun.kumar1@student.com
  - priya.singh2@student.com
  - rahul.patel3@student.com
  - anjali.sharma4@student.com
  - (and 196+ more students)

**Password:** 123456

---

## Technical Details

### Authentication Flow
1. **Login Form** - User enters email and password
2. **Auth Service** - Validates credentials:
   - Checks password matches `123456`
   - For Admin: Checks if email is `admin@gmail.com`
   - For Teacher: Checks if email exists in TeacherService
   - For Student: Checks if email exists in StudentService
3. **Session Storage** - User info saved in localStorage as `currentUser`
4. **Navigation** - Routes to appropriate dashboard based on role

### Files Updated
- `src/app/core/services/auth.service.ts` - Added credential validation
- `src/app/core/services/student.service.ts` - Added `getAllStudentsSync()` method
- `src/app/core/services/teacher.service.ts` - Added `getAllTeachersSync()` method
- `src/app/modules/auth/login/login.component.ts` - Updated login logic to save session
- `src/app/modules/auth/login/login.component.html` - Updated demo credentials display

### Session Storage
**Key:** `currentUser`
**Content:**
```json
{
  "email": "admin@gmail.com",
  "role": "ADMIN",
  "loginTime": "2025-12-17T10:30:45.123Z"
}
```

---

## How to Test

### Test Admin Login
1. Open login page
2. Email: `admin@gmail.com`
3. Password: `123456`
4. Click Sign In
5. Should navigate to Admin Dashboard

### Test Teacher Login
1. Open login page
2. Email: `rajesh@school.com` (or any teacher email)
3. Password: `123456`
4. Click Sign In
5. Should navigate to Teacher Dashboard

### Test Student Login
1. Open login page
2. Email: `arjun.kumar1@student.com` (or any student email)
3. Password: `123456`
4. Click Sign In
5. Should navigate to Student Dashboard

---

## Logout
- Clears `currentUser` from localStorage
- Also clears all other stored data
- Redirects to login page

---

## Security Note
⚠️ **This is a development system with fake authentication.**
- All passwords are the same (123456)
- Emails are hardcoded demo data
- In production, implement:
  - Bcrypt password hashing
  - JWT token-based authentication
  - Secure session management
  - Password reset functionality
  - Email verification
