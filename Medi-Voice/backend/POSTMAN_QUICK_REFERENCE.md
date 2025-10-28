# 🚀 Medi-Hub API Quick Reference for Postman

## 🏥 Server Information
- **Base URL**: `http://localhost:5000`
- **Environment**: Development
- **Database**: MongoDB Atlas (medivoice)

## 🔧 Postman Environment Variables Setup

Create these environment variables in Postman:

| Variable Name | Initial Value | Description |
|--------------|---------------|-------------|
| `base_url` | `http://localhost:5000` | Server base URL |
| `patient_token` | *(empty)* | Patient JWT token |
| `doctor_token` | *(empty)* | Doctor JWT token |
| `admin_token` | *(empty)* | Admin JWT token |
| `staff_token` | *(empty)* | Staff JWT token |
| `lab_token` | *(empty)* | Lab technician JWT token |

## 🎯 Quick Test Sequence

### 1. Health Check
```http
GET {{base_url}}/health
```

### 2. API Documentation
```http
GET {{base_url}}/api
```

### 3. Register Users (Run these first)

#### Patient Registration
```http
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Patient",
  "email": "patient@test.com",
  "password": "SecurePass123!",
  "role": "patient",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "gender": "male"
}
```

#### Doctor Registration
```http
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "firstName": "Dr. Sarah",
  "lastName": "Doctor",
  "email": "doctor@test.com",
  "password": "SecurePass123!",
  "role": "doctor",
  "phone": "+1234567891",
  "specialization": "Cardiology",
  "licenseNumber": "MD123456",
  "experience": 5,
  "consultationFee": 150
}
```

#### Admin Registration
```http
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@test.com",
  "password": "SecurePass123!",
  "role": "admin",
  "phone": "+1234567892"
}
```

#### Staff Registration
```http
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "firstName": "Staff",
  "lastName": "Member",
  "email": "staff@test.com",
  "password": "SecurePass123!",
  "role": "staff",
  "phone": "+1234567893"
}
```

#### Lab Technician Registration
```http
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "firstName": "Lab",
  "lastName": "Tech",
  "email": "lab@test.com",
  "password": "SecurePass123!",
  "role": "lab_tech",
  "phone": "+1234567894"
}
```

### 4. Login (Save tokens to environment)

#### Patient Login
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "patient@test.com",
  "password": "SecurePass123!"
}
```

*Copy the token and save it as `patient_token` in your environment*

### 5. Test Role-Specific Dashboards

#### Patient Dashboard
```http
GET {{base_url}}/api/patient/dashboard
Authorization: Bearer {{patient_token}}
```

#### Doctor Dashboard
```http
GET {{base_url}}/api/doctor/dashboard
Authorization: Bearer {{doctor_token}}
```

#### Admin Dashboard
```http
GET {{base_url}}/api/admin/dashboard
Authorization: Bearer {{admin_token}}
```

#### Staff Dashboard
```http
GET {{base_url}}/api/staff/dashboard
Authorization: Bearer {{staff_token}}
```

#### Laboratory Dashboard
```http
GET {{base_url}}/api/laboratory/dashboard
Authorization: Bearer {{lab_token}}
```

## 📱 Common Request Headers

For authenticated requests:
```
Content-Type: application/json
Authorization: Bearer {{token_variable}}
```

For public requests:
```
Content-Type: application/json
```

## 🔄 Role-Based Route Testing

### Patient Routes (role: patient)
- `GET /api/patient/dashboard`
- `GET /api/patient/profile`
- `PUT /api/patient/profile`
- `GET /api/patient/appointments`
- `POST /api/patient/appointments`
- `GET /api/patient/medical-records`
- `GET /api/patient/doctors/search`

### Doctor Routes (role: doctor)
- `GET /api/doctor/dashboard`
- `GET /api/doctor/profile`
- `PUT /api/doctor/profile`
- `GET /api/doctor/appointments`
- `GET /api/doctor/patients`
- `GET /api/doctor/analytics`

### Staff Routes (role: staff)
- `GET /api/staff/dashboard`
- `GET /api/staff/appointments`
- `POST /api/staff/appointments`
- `GET /api/staff/patients`
- `POST /api/staff/patients/register`

### Admin Routes (role: admin)
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `GET /api/admin/doctors`
- `GET /api/admin/analytics`

### Laboratory Routes (role: lab_tech)
- `GET /api/laboratory/dashboard`
- `GET /api/laboratory/test-orders`
- `POST /api/laboratory/test-orders/:id/results`
- `GET /api/laboratory/tests`

## 🚨 Error Testing

### Test with Wrong Role
Try accessing patient endpoints with doctor token:
```http
GET {{base_url}}/api/patient/dashboard
Authorization: Bearer {{doctor_token}}
```
*Expected: 403 Forbidden*

### Test without Authentication
```http
GET {{base_url}}/api/patient/dashboard
```
*Expected: 401 Unauthorized*

### Test with Invalid Token
```http
GET {{base_url}}/api/patient/dashboard
Authorization: Bearer invalid_token_here
```
*Expected: 401 Unauthorized*

## 📊 Response Status Codes

| Code | Meaning | When to Expect |
|------|---------|----------------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (new resource) |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Wrong role/permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## 🎯 Postman Test Scripts

Add these test scripts to automatically validate responses:

### Basic Success Test
```javascript
pm.test("Request successful", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success', true);
});
```

### Token Extraction Test (for login requests)
```javascript
pm.test("Save token to environment", function () {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
        pm.environment.set("patient_token", jsonData.data.token);
    }
});
```

### Role Validation Test
```javascript
pm.test("User has correct role", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.user.role).to.eql("patient");
});
```

## 🔗 Quick Links

- **Server Health**: `{{base_url}}/health`
- **API Documentation**: `{{base_url}}/api`
- **Patient Dashboard**: `{{base_url}}/api/patient/dashboard`
- **Doctor Dashboard**: `{{base_url}}/api/doctor/dashboard`
- **Admin Dashboard**: `{{base_url}}/api/admin/dashboard`

## 📝 Notes

1. **Always register users before testing role-specific routes**
2. **Save tokens from login responses to environment variables**
3. **Use proper Authorization headers for protected routes**
4. **Check server logs for detailed error information**
5. **MongoDB warnings about duplicate indexes can be ignored**

---

*This quick reference covers the essential routing and testing information for the Medi-Hub API. For complete documentation, see ROUTING_GUIDE.md*