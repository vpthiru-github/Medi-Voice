# Enhanced Postman Testing Guide for MediHub Backend

## Updated Collection Structure

Your Postman collection should now be organized by user roles for better testing workflow:

```
MediHub API v2/
├── 🔐 Authentication/
│   ├── Register User
│   ├── Login User
│   ├── Refresh Token
│   ├── Forgot Password
│   ├── Reset Password
│   └── Change Password
├── 👨‍⚕️ Doctor Operations/
│   ├── Profile Management/
│   ├── Appointment Management/
│   ├── Patient Management/
│   └── Analytics/
├── 🏥 Patient Operations/
│   ├── Profile Management/
│   ├── Appointment Booking/
│   ├── Medical Records/
│   └── Health Tracking/
├── 👩‍💼 Staff Operations/
│   ├── Profile Management/
│   ├── Appointment Management/
│   ├── Patient Registration/
│   └── Doctor Scheduling/
├── 🧪 Laboratory Operations/
│   ├── Profile Management/
│   ├── Test Management/
│   ├── Results Submission/
│   └── Reports/
├── 👑 Admin Operations/
│   ├── User Management/
│   ├── System Analytics/
│   ├── Financial Reports/
│   └── Notifications/
└── 🔄 Legacy Endpoints/
    └── (Backward compatibility tests)
```

## Environment Setup

### Environment Variables
```json
{
  "base_url": "http://localhost:5000/api",
  "doctor_token": "",
  "patient_token": "",
  "staff_token": "",
  "lab_token": "",
  "admin_token": "",
  "test_doctor_id": "",
  "test_patient_id": "",
  "test_appointment_id": ""
}
```

## Enhanced Testing Workflow

### 1. Authentication Setup

#### Register Test Users
Create one user for each role:

**Doctor Registration:**
```json
POST {{base_url}}/auth/register
{
  "firstName": "Dr. John",
  "lastName": "Smith",
  "email": "doctor@medihub.com",
  "password": "Doctor123!",
  "role": "doctor",
  "phone": "+1234567890"
}
```

**Patient Registration:**
```json
POST {{base_url}}/auth/register
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "patient@medihub.com",
  "password": "Patient123!",
  "role": "patient",
  "phone": "+1234567891"
}
```

**Staff Registration:**
```json
POST {{base_url}}/auth/register
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "staff@medihub.com",
  "password": "Staff123!",
  "role": "staff",
  "phone": "+1234567892"
}
```

**Lab Tech Registration:**
```json
POST {{base_url}}/auth/register
{
  "firstName": "Bob",
  "lastName": "Wilson",
  "email": "lab@medihub.com",
  "password": "Lab123!",
  "role": "lab_tech",
  "phone": "+1234567893"
}
```

**Admin Registration:**
```json
POST {{base_url}}/auth/register
{
  "firstName": "Super",
  "lastName": "Admin",
  "email": "admin@medihub.com",
  "password": "Admin123!",
  "role": "admin",
  "phone": "+1234567894"
}
```

### 2. Login and Token Storage

**Test Script for Login Requests:**
```javascript
// Store token based on user role
if (pm.response.code === 200) {
    const response = pm.response.json();
    const token = response.data.token;
    const userRole = response.data.user.role;
    
    // Store token in environment variable based on role
    pm.environment.set(`${userRole}_token`, token);
    
    // Store user ID for future requests
    pm.environment.set(`test_${userRole}_id`, response.data.user._id);
    
    console.log(`${userRole} token stored successfully`);
}
```

### 3. Role-Based Testing

#### Doctor Operations Testing

**Get Doctor Profile:**
```
GET {{base_url}}/doctor/profile
Authorization: Bearer {{doctor_token}}
```

**Update Doctor Availability:**
```json
PUT {{base_url}}/doctor/availability
Authorization: Bearer {{doctor_token}}
{
  "availability": {
    "monday": {
      "isAvailable": true,
      "slots": [
        {
          "startTime": "09:00",
          "endTime": "12:00"
        },
        {
          "startTime": "14:00",
          "endTime": "17:00"
        }
      ]
    }
  }
}
```

**Get Doctor's Appointments:**
```
GET {{base_url}}/doctor/appointments?status=scheduled&page=1&limit=10
Authorization: Bearer {{doctor_token}}
```

#### Patient Operations Testing

**Create Patient Profile:**
```json
POST {{base_url}}/patient/profile
Authorization: Bearer {{patient_token}}
{
  "dateOfBirth": "1990-05-15",
  "gender": "female",
  "bloodType": "O+",
  "allergies": ["penicillin"],
  "emergencyContact": {
    "name": "John Doe",
    "relationship": "spouse",
    "phone": "+1234567890"
  },
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Book Appointment:**
```json
POST {{base_url}}/patient/appointments
Authorization: Bearer {{patient_token}}
{
  "doctor": "{{test_doctor_id}}",
  "scheduledTime": "2024-01-20T10:00:00.000Z",
  "reason": "Regular checkup",
  "symptoms": ["fatigue", "headache"],
  "duration": 30
}
```

#### Staff Operations Testing

**Get All Appointments:**
```
GET {{base_url}}/staff/appointments?date=2024-01-20&status=scheduled
Authorization: Bearer {{staff_token}}
```

**Register New Patient:**
```json
POST {{base_url}}/staff/patients
Authorization: Bearer {{staff_token}}
{
  "firstName": "New",
  "lastName": "Patient",
  "email": "newpatient@example.com",
  "phone": "+1234567899",
  "dateOfBirth": "1985-03-10",
  "gender": "male"
}
```

#### Laboratory Operations Testing

**Get Test Orders:**
```
GET {{base_url}}/laboratory/test-orders?status=pending
Authorization: Bearer {{lab_token}}
```

**Submit Test Results:**
```json
POST {{base_url}}/laboratory/test-results
Authorization: Bearer {{lab_token}}
{
  "testOrderId": "test_order_123",
  "results": {
    "hemoglobin": "14.2 g/dL",
    "whiteBloodCells": "7500 /μL",
    "platelets": "250000 /μL"
  },
  "notes": "All values within normal range",
  "reportUrl": "https://example.com/report.pdf"
}
```

#### Admin Operations Testing

**Get All Users:**
```
GET {{base_url}}/admin/users?role=doctor&page=1&limit=10
Authorization: Bearer {{admin_token}}
```

**Get System Analytics:**
```
GET {{base_url}}/admin/analytics?period=30d
Authorization: Bearer {{admin_token}}
```

### 4. Automated Test Scripts

#### Pre-request Script (for authenticated requests):
```javascript
// Check if token exists for the required role
const requiredRole = pm.variables.get("required_role");
if (requiredRole) {
    const token = pm.environment.get(`${requiredRole}_token`);
    if (!token) {
        throw new Error(`No token found for role: ${requiredRole}. Please login first.`);
    }
    pm.request.headers.add({
        key: 'Authorization',
        value: `Bearer ${token}`
    });
}
```

#### Test Script (for all requests):
```javascript
// Common tests for all API responses
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Response has correct structure", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('success');
    pm.expect(response).to.have.property('message');
    
    if (response.success) {
        pm.expect(response).to.have.property('data');
    } else {
        pm.expect(response).to.have.property('error');
    }
});

pm.test("Status code is successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

// Role-specific tests
const endpoint = pm.request.url.getPath();
if (endpoint.includes('/doctor/')) {
    pm.test("Doctor endpoint security", function () {
        // Additional doctor-specific validations
    });
}

if (endpoint.includes('/patient/')) {
    pm.test("Patient endpoint security", function () {
        // Additional patient-specific validations
    });
}
```

### 5. Error Testing

#### Test Unauthorized Access:
```
GET {{base_url}}/doctor/profile
# No Authorization header - should return 401
```

#### Test Wrong Role Access:
```
GET {{base_url}}/admin/users
Authorization: Bearer {{patient_token}}
# Patient trying to access admin endpoint - should return 403
```

#### Test Invalid Data:
```json
POST {{base_url}}/patient/appointments
Authorization: Bearer {{patient_token}}
{
  "doctor": "invalid_id",
  "scheduledTime": "invalid_date"
}
# Should return 400 with validation errors
```

### 6. Collection Runner Setup

**Environment Configuration:**
- Create separate environments for Development, Staging, and Production
- Set appropriate base URLs and rate limits

**Test Data Management:**
- Use CSV files for bulk testing with different user data
- Implement data cleanup scripts for test isolation

**Continuous Testing:**
- Set up collection runs with Newman for CI/CD
- Generate HTML reports for test results

### 7. Performance Testing

**Load Testing Scenarios:**
```
1. Authentication Load: 100 concurrent login requests
2. Doctor Search: 50 concurrent search requests
3. Appointment Booking: 25 concurrent booking requests
4. Data Retrieval: 100 concurrent profile requests
```

### 8. Security Testing

**Test Cases:**
```
1. SQL Injection attempts in search parameters
2. XSS attempts in text fields
3. JWT token tampering
4. Rate limiting validation
5. CORS policy testing
6. Password strength validation
```

## Running the Complete Test Suite

1. **Setup Phase:** Register all test users
2. **Authentication Phase:** Login all users and store tokens
3. **Functional Testing:** Test all role-based endpoints
4. **Integration Testing:** Test cross-role workflows
5. **Error Testing:** Validate error handling
6. **Performance Testing:** Load test critical endpoints
7. **Security Testing:** Validate security measures
8. **Cleanup Phase:** Remove test data

This comprehensive testing approach ensures your new role-based routing system works correctly across all user types while maintaining security and performance standards.