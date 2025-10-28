# 🏥 Medi-Hub Backend API Routing Guide

## 🌐 Base URL
```
http://localhost:5000
```

## 📚 Table of Contents
1. [Authentication Routes](#authentication-routes)
2. [Patient Routes](#patient-routes)
3. [Doctor Routes](#doctor-routes)
4. [Staff Routes](#staff-routes)
5. [Admin Routes](#admin-routes)
6. [Laboratory Routes](#laboratory-routes)
7. [Legacy Routes](#legacy-routes)
8. [Health Check](#health-check)

---

## 🔐 Authentication Routes
**Base Path**: `/api/auth`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/logout` | User logout | Private |
| POST | `/forgot-password` | Send password reset email | Public |
| POST | `/reset-password` | Reset password with token | Public |
| POST | `/change-password` | Change password | Private |
| GET | `/me` | Get current user profile | Private |
| PUT | `/profile` | Update user profile | Private |
| POST | `/verify-email` | Send email verification | Private |
| GET | `/verify-email/:token` | Verify email with token | Public |
| GET | `/check-token` | Check token validity | Private |

### Sample Authentication Requests:

#### Register Patient
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "patient@test.com",
  "password": "SecurePass123!",
  "role": "patient",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "gender": "male"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "patient@test.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

---

## 👤 Patient Routes
**Base Path**: `/api/patient`
**Required Role**: `patient`
**Authentication**: Required for all routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get patient dashboard data |
| GET | `/profile` | Get patient profile |
| PUT | `/profile` | Update patient profile |
| PUT | `/vitals` | Update patient vitals |
| GET | `/appointments` | Get patient appointments |
| POST | `/appointments` | Book new appointment |
| GET | `/appointments/:id` | Get specific appointment |
| PUT | `/appointments/:id` | Update appointment |
| DELETE | `/appointments/:id/cancel` | Cancel appointment |
| GET | `/medical-records` | Get medical records |
| GET | `/medical-records/:id` | Get specific medical record |
| GET | `/doctors/search` | Search doctors |
| GET | `/doctors/:id` | Get doctor details |
| GET | `/doctors/:id/availability` | Check doctor availability |
| GET | `/doctors/:id/reviews` | Get doctor reviews |
| POST | `/feedback` | Submit doctor feedback |

### Sample Patient Requests:

#### Get Dashboard
```http
GET /api/patient/dashboard
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Update Profile
```http
PUT /api/patient/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "medicalInfo": {
    "allergies": ["Peanuts", "Shellfish"],
    "bloodType": "O+",
    "chronicConditions": ["Hypertension"],
    "currentMedications": ["Lisinopril 10mg"]
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "spouse",
    "phone": "+1234567892"
  }
}
```

#### Book Appointment
```http
POST /api/patient/appointments
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "doctor": "DOCTOR_ID_HERE",
  "appointmentDate": "2025-09-25",
  "appointmentTime": "10:00",
  "appointmentType": "consultation",
  "reason": "Regular checkup",
  "notes": "Annual physical examination"
}
```

---

## 👨‍⚕️ Doctor Routes
**Base Path**: `/api/doctor`
**Required Role**: `doctor`
**Authentication**: Required for all routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get doctor dashboard |
| GET | `/profile` | Get doctor profile |
| PUT | `/profile` | Update doctor profile |
| PUT | `/availability` | Update availability |
| GET | `/appointments` | Get doctor appointments |
| GET | `/appointments/today` | Get today's appointments |
| PUT | `/appointments/:id` | Update appointment |
| POST | `/appointments/:id/complete` | Complete appointment |
| GET | `/patients` | Get doctor's patients |
| GET | `/patients/:id` | Get specific patient |
| POST | `/patients/:id/medical-record` | Add medical record |
| GET | `/patients/:id/history` | Get patient history |
| GET | `/schedule` | Get doctor schedule |
| PUT | `/schedule` | Update schedule |
| GET | `/analytics` | Get doctor analytics |
| GET | `/earnings` | Get earnings report |
| GET | `/reviews` | Get doctor reviews |

### Sample Doctor Requests:

#### Get Dashboard
```http
GET /api/doctor/dashboard
Authorization: Bearer DOCTOR_TOKEN_HERE
```

#### Update Availability
```http
PUT /api/doctor/availability
Authorization: Bearer DOCTOR_TOKEN_HERE
Content-Type: application/json

{
  "monday": {
    "available": true,
    "slots": [
      { "startTime": "09:00", "endTime": "12:00" },
      { "startTime": "14:00", "endTime": "17:00" }
    ]
  },
  "tuesday": {
    "available": true,
    "slots": [
      { "startTime": "09:00", "endTime": "12:00" }
    ]
  }
}
```

---

## 👥 Staff Routes
**Base Path**: `/api/staff`
**Required Role**: `staff`
**Authentication**: Required for all routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get staff dashboard |
| GET | `/appointments` | Get all appointments |
| POST | `/appointments` | Create appointment |
| PUT | `/appointments/:id` | Update appointment |
| DELETE | `/appointments/:id` | Cancel appointment |
| GET | `/patients` | Get all patients |
| POST | `/patients/register` | Register new patient |
| PUT | `/patients/:id` | Update patient info |
| GET | `/doctors` | Get all doctors |
| GET | `/notifications` | Get notifications |
| POST | `/notifications` | Send notification |
| GET | `/reports/daily` | Get daily report |
| GET | `/reports/appointments` | Get appointment report |

### Sample Staff Requests:

#### Get All Appointments
```http
GET /api/staff/appointments?page=1&limit=10&status=scheduled
Authorization: Bearer STAFF_TOKEN_HERE
```

#### Register Patient
```http
POST /api/staff/patients/register
Authorization: Bearer STAFF_TOKEN_HERE
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@email.com",
  "phone": "+1234567890",
  "dateOfBirth": "1985-03-20",
  "gender": "female",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

---

## 👑 Admin Routes
**Base Path**: `/api/admin`
**Required Role**: `admin`
**Authentication**: Required for all routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get admin dashboard |
| GET | `/users` | Get all users |
| POST | `/users` | Create new user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| GET | `/doctors` | Get all doctors |
| POST | `/doctors/verify/:id` | Verify doctor |
| PUT | `/doctors/:id/status` | Update doctor status |
| GET | `/analytics` | Get system analytics |
| GET | `/analytics/revenue` | Get revenue analytics |
| GET | `/settings` | Get system settings |
| PUT | `/settings` | Update system settings |

### Sample Admin Requests:

#### Get System Analytics
```http
GET /api/admin/analytics?period=monthly
Authorization: Bearer ADMIN_TOKEN_HERE
```

#### Verify Doctor
```http
POST /api/admin/doctors/verify/DOCTOR_ID_HERE
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "verified": true,
  "notes": "All credentials verified successfully"
}
```

---

## 🧪 Laboratory Routes
**Base Path**: `/api/laboratory`
**Required Role**: `lab_tech`
**Authentication**: Required for all routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get lab dashboard |
| GET | `/test-orders` | Get test orders |
| PUT | `/test-orders/:id` | Update test order |
| POST | `/test-orders/:id/results` | Add test results |
| GET | `/tests` | Get available tests |
| POST | `/tests` | Create new test |
| GET | `/patients/:id/history` | Get patient lab history |
| GET | `/reports/daily` | Get daily lab report |
| GET | `/reports/pending` | Get pending tests report |
| GET | `/equipment` | Get lab equipment status |

### Sample Laboratory Requests:

#### Get Test Orders
```http
GET /api/laboratory/test-orders?status=pending
Authorization: Bearer LAB_TOKEN_HERE
```

#### Add Test Results
```http
POST /api/laboratory/test-orders/ORDER_ID_HERE/results
Authorization: Bearer LAB_TOKEN_HERE
Content-Type: application/json

{
  "results": {
    "bloodSugar": "95 mg/dL",
    "cholesterol": "180 mg/dL",
    "hemoglobin": "14.2 g/dL"
  },
  "notes": "All values within normal range",
  "completedBy": "Lab Tech ID"
}
```

---

## 🔄 Legacy Routes (Backward Compatibility)
**Note**: These routes are maintained for backward compatibility

| Base Path | Description |
|-----------|-------------|
| `/api/users` | User management (use `/api/auth` instead) |
| `/api/doctors` | Doctor management (use `/api/doctor` instead) |
| `/api/patients` | Patient management (use `/api/patient` instead) |
| `/api/appointments` | Appointment management |
| `/api/medical-records` | Medical records management |
| `/api/prescriptions` | Prescription management |
| `/api/analytics` | Analytics endpoints |

---

## 🏥 Health Check
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/health` | Server health check | Public |
| GET | `/api` | API documentation | Public |

### Health Check Response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-09-22T10:30:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

---

## 🛡️ Authentication Headers
For all protected routes, include:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

## 📝 Common Query Parameters
- `page`: Page number for pagination (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field and direction (e.g., "createdAt:desc")
- `search`: Search term for filtering
- `status`: Filter by status
- `date`: Filter by date range

## 🚨 Error Response Format
All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
```

## 📊 Success Response Format
All successful responses follow this format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    // Response data here
  },
  "pagination": {
    // Pagination info (when applicable)
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🔗 Quick Testing URLs

### Authentication
- Register: `POST http://localhost:5000/api/auth/register`
- Login: `POST http://localhost:5000/api/auth/login`

### Patient Dashboard
- Dashboard: `GET http://localhost:5000/api/patient/dashboard`

### Health Check
- Health: `GET http://localhost:5000/health`
- API Info: `GET http://localhost:5000/api`

---

*This routing guide covers all available endpoints in the Medi-Hub backend API. For testing, use the Postman collection or any HTTP client with the provided examples.*