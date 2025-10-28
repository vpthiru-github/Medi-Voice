# MediHub Backend API Documentation

## Enhanced Role-Based Routing Structure

The MediHub backend now provides a comprehensive role-based routing system for better organization and security. Each user role has dedicated endpoints while maintaining backward compatibility.

## Base URL
```
http://localhost:5000/api
```

---

## 1. Authentication Routes
**Base Path:** `/api/auth`

### Endpoints:
```
POST /api/auth/register         - User registration
POST /api/auth/login           - User login
POST /api/auth/logout          - User logout
POST /api/auth/refresh-token   - Refresh JWT token
POST /api/auth/forgot-password - Request password reset
POST /api/auth/reset-password  - Reset password with token
PUT  /api/auth/change-password - Change password (authenticated)
GET  /api/auth/verify-token    - Verify JWT token
```

---

## 2. Doctor Routes
**Base Path:** `/api/doctor`

### Authentication Required: `doctor` role

### Profile Management:
```
GET  /api/doctor/profile              - Get doctor profile
POST /api/doctor/profile              - Create/update doctor profile
PUT  /api/doctor/profile              - Update doctor profile
PUT  /api/doctor/availability         - Update availability schedule
```

### Appointment Management:
```
GET  /api/doctor/appointments         - Get doctor's appointments
GET  /api/doctor/appointments/:id     - Get specific appointment
PUT  /api/doctor/appointments/:id     - Update appointment
```

### Patient Management:
```
GET  /api/doctor/patients             - Get doctor's patients
GET  /api/doctor/patients/:id         - Get specific patient details
POST /api/doctor/patients/:id/notes   - Add patient notes
```

### Analytics & Reports:
```
GET  /api/doctor/analytics            - Get doctor analytics
GET  /api/doctor/dashboard            - Get dashboard data
```

### Public Endpoints (No Auth Required):
```
GET  /api/doctor/search               - Search doctors
GET  /api/doctor/:id                  - Get doctor details
GET  /api/doctor/:id/availability     - Get doctor availability
```

---

## 3. Patient Routes
**Base Path:** `/api/patient`

### Authentication Required: `patient` role

### Profile Management:
```
GET  /api/patient/profile             - Get patient profile
POST /api/patient/profile             - Create patient profile
PUT  /api/patient/profile             - Update patient profile
```

### Appointment Management:
```
GET  /api/patient/appointments        - Get patient's appointments
POST /api/patient/appointments        - Book new appointment
PUT  /api/patient/appointments/:id    - Update appointment
DELETE /api/patient/appointments/:id  - Cancel appointment
```

### Medical Records:
```
GET  /api/patient/medical-records     - Get medical records
GET  /api/patient/medical-records/:id - Get specific record
```

### Prescriptions:
```
GET  /api/patient/prescriptions       - Get prescriptions
GET  /api/patient/prescriptions/:id   - Get specific prescription
```

### Health Tracking:
```
GET  /api/patient/vitals              - Get vital signs history
POST /api/patient/vitals              - Add vital signs
GET  /api/patient/health-metrics      - Get health metrics
```

---

## 4. Staff Routes
**Base Path:** `/api/staff`

### Authentication Required: `staff` role

### Profile Management:
```
GET  /api/staff/profile               - Get staff profile
PUT  /api/staff/profile               - Update staff profile
```

### Appointment Management:
```
GET  /api/staff/appointments          - Get all appointments
POST /api/staff/appointments          - Create appointment
PUT  /api/staff/appointments/:id      - Update appointment
DELETE /api/staff/appointments/:id    - Cancel appointment
```

### Patient Management:
```
GET  /api/staff/patients              - Get all patients
POST /api/staff/patients              - Register new patient
PUT  /api/staff/patients/:id          - Update patient info
```

### Doctor Management:
```
GET  /api/staff/doctors               - Get all doctors
GET  /api/staff/doctors/:id           - Get doctor details
PUT  /api/staff/doctors/:id/schedule  - Update doctor schedule
```

### Dashboard & Analytics:
```
GET  /api/staff/dashboard             - Get staff dashboard
GET  /api/staff/analytics             - Get staff analytics
```

---

## 5. Laboratory Routes
**Base Path:** `/api/laboratory`

### Authentication Required: `lab_tech` role

### Profile Management:
```
GET  /api/laboratory/profile          - Get lab tech profile
PUT  /api/laboratory/profile          - Update lab tech profile
```

### Test Management:
```
GET  /api/laboratory/test-orders      - Get lab test orders
POST /api/laboratory/test-results     - Submit test results
PUT  /api/laboratory/test-orders/:id/status - Update test status
```

### Patient Management:
```
GET  /api/laboratory/patients         - Get patients with lab orders
```

### Reports & Analytics:
```
GET  /api/laboratory/dashboard        - Get lab dashboard
GET  /api/laboratory/reports          - Get lab reports
```

---

## 6. Admin Routes
**Base Path:** `/api/admin`

### Authentication Required: `admin` role

### User Management:
```
GET  /api/admin/users                 - Get all users
POST /api/admin/users                 - Create new user
PUT  /api/admin/users/:id             - Update user
DELETE /api/admin/users/:id           - Delete user
PUT  /api/admin/users/:id/status      - Update user status
```

### System Management:
```
GET  /api/admin/appointments          - Get all appointments
GET  /api/admin/analytics             - Get system analytics
GET  /api/admin/notifications         - Get system notifications
```

### Financial Overview:
```
GET  /api/admin/financial             - Get financial overview
GET  /api/admin/revenue               - Get revenue reports
```

---

## Legacy Routes (Backward Compatibility)

All existing routes are still available for backward compatibility:

```
/api/users                           - User management
/api/doctors                         - Doctor management
/api/patients                        - Patient management
/api/appointments                    - Appointment management
/api/medical-records                 - Medical records
/api/prescriptions                   - Prescription management
/api/analytics                       - Analytics
```

---

## Authentication

### JWT Token Format
```json
{
  "id": "user_id",
  "role": "user_role",
  "iat": timestamp,
  "exp": timestamp
}
```

### Headers Required
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Role Hierarchy
1. `admin` - Full system access
2. `doctor` - Medical professional access
3. `staff` - Administrative access
4. `lab_tech` - Laboratory operations
5. `patient` - Personal health records

---

## Common Query Parameters

### Pagination
```
?page=1&limit=10
```

### Search
```
?search=term
```

### Filtering
```
?status=active&date=2024-01-15
```

### Sorting
```
?sort=createdAt&order=desc
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details",
  "stack": "Error stack (development only)"
}
```

---

## Testing with Postman

### Environment Variables
```
base_url = http://localhost:5000/api
auth_token = {{jwt_token}}
```

### Collection Structure
```
MediHub API/
├── Authentication/
├── Doctor Operations/
├── Patient Operations/
├── Staff Operations/
├── Laboratory Operations/
├── Admin Operations/
└── Legacy Endpoints/
```

### Test Scripts
Each request includes automated tests for:
- Response status validation
- Response format validation  
- Data structure validation
- Token extraction and storage

---

## Security Features

1. **Rate Limiting**: 100 requests per 15 minutes (production)
2. **Authentication Rate Limiting**: 5 auth requests per 15 minutes
3. **CORS Protection**: Configured origins and headers
4. **Helmet Security**: Security headers
5. **Data Sanitization**: NoSQL injection protection
6. **Password Hashing**: bcrypt with salt rounds
7. **JWT Security**: Secure token generation and validation

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 409  | Conflict |
| 422  | Validation Error |
| 429  | Too Many Requests |
| 500  | Internal Server Error |

---

This enhanced routing structure provides better organization, improved security through role-based access control, and maintains backward compatibility with existing integrations.