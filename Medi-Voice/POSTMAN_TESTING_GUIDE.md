# Postman Testing Guide - MediHub Backend API

## Base URL
```
http://localhost:5000
```

## Collection Structure

### 1. Health Check Endpoints

#### 1.1 Basic Health Check
- **Method**: GET
- **URL**: `http://localhost:5000/health`
- **Description**: Check if server is running
- **Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-23T19:26:11.000Z",
  "uptime": "00:01:30",
  "version": "1.0.0",
  "environment": "development"
}
```

#### 1.2 API Test Endpoint
- **Method**: GET
- **URL**: `http://localhost:5000/api/test`
- **Description**: Test API routing
- **Expected Response**:
```json
{
  "message": "Enhanced MediHub API is working!",
  "timestamp": "2025-09-23T19:26:11.000Z",
  "version": "1.0.0"
}
```

### 2. Authentication Endpoints

#### 2.1 User Registration
- **Method**: POST
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "patient",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```
- **Expected Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64f8b1234567890abcdef123",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "patient",
      "isActive": true,
      "createdAt": "2025-09-23T19:26:11.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2.2 User Login
- **Method**: POST
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "rememberMe": true
}
```
- **Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f8b1234567890abcdef123",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2.3 Demo Login
- **Method**: POST
- **URL**: `http://localhost:5000/api/auth/demo-login`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
```json
{
  "role": "patient",
  "name": "Demo Patient"
}
```
- **Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Demo login successful",
  "data": {
    "user": {
      "id": "demo-patient-123",
      "name": "Demo Patient",
      "email": "demo.patient@medihub.com",
      "role": "patient",
      "isDemo": true
    },
    "token": "demo-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2.4 Get User Profile (Protected Route)
- **Method**: GET
- **URL**: `http://localhost:5000/api/auth/me`
- **Headers**:
  ```
  Authorization: Bearer YOUR_JWT_TOKEN_HERE
  ```
- **Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8b1234567890abcdef123",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "patient",
      "phone": "+1234567890",
      "isActive": true,
      "createdAt": "2025-09-23T19:26:11.000Z"
    }
  }
}
```

#### 2.5 Update Profile (Protected Route)
- **Method**: PUT
- **URL**: `http://localhost:5000/api/auth/profile`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN_HERE
  ```
- **Body** (raw JSON):
```json
{
  "name": "John Smith",
  "phone": "+1234567891",
  "address": {
    "street": "456 Oak St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90210",
    "country": "USA"
  }
}
```

#### 2.6 Change Password (Protected Route)
- **Method**: POST
- **URL**: `http://localhost:5000/api/auth/change-password`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN_HERE
  ```
- **Body** (raw JSON):
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

#### 2.7 Logout (Protected Route)
- **Method**: POST
- **URL**: `http://localhost:5000/api/auth/logout`
- **Headers**:
  ```
  Authorization: Bearer YOUR_JWT_TOKEN_HERE
  ```

### 3. Demo Data Endpoints

#### 3.1 Get Demo Doctors
- **Method**: GET
- **URL**: `http://localhost:5000/api/demo/doctors`
- **Expected Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "doc-1",
      "name": "Dr. Sarah Johnson",
      "specialty": "Cardiologist",
      "experience": "15 years",
      "rating": 4.9,
      "availability": "Available",
      "image": "/api/placeholder/150/150"
    }
  ]
}
```

#### 3.2 Get Demo Patients
- **Method**: GET
- **URL**: `http://localhost:5000/api/demo/patients`
- **Expected Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "patient-1",
      "name": "Emily Chen",
      "age": 28,
      "condition": "Regular Checkup",
      "lastVisit": "2024-01-15",
      "status": "Active"
    }
  ]
}
```

#### 3.3 Get Demo Laboratories
- **Method**: GET
- **URL**: `http://localhost:5000/api/demo/laboratories`
- **Expected Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "lab-1",
      "name": "Central Medical Lab",
      "type": "Diagnostic Center",
      "location": "Downtown",
      "services": ["Blood Test", "X-Ray", "MRI"],
      "status": "Open",
      "turnaroundTime": "24 hours"
    }
  ]
}
```

## Testing Workflow

### Step 1: Test Basic Connectivity
1. Test health check endpoint
2. Test API test endpoint

### Step 2: Test Authentication Flow
1. Register a new user
2. Login with the registered user
3. Save the JWT token from login response
4. Test protected routes using the token

### Step 3: Test Demo Endpoints
1. Test demo login
2. Get demo doctors data
3. Get demo patients data
4. Get demo laboratories data

### Step 4: Test Error Scenarios
1. Try login with wrong credentials
2. Try accessing protected routes without token
3. Try registering with duplicate email
4. Try invalid request formats

## Postman Environment Variables

Create a Postman environment with these variables:
- `baseURL`: `http://localhost:5000`
- `apiURL`: `http://localhost:5000/api`
- `authToken`: (will be set after login)

## Setting Up Authorization

After successful login:
1. Copy the `token` from the response
2. Go to the Authorization tab in your request
3. Select "Bearer Token" type
4. Paste the token in the Token field

Or use Postman environment variable:
1. Save token as `{{authToken}}`
2. Use `{{authToken}}` in Authorization header

## Expected Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Rate Limiting

The API has rate limiting enabled:
- **Registration**: 5 requests per 15 minutes per IP
- **Login**: 10 requests per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP

If you hit the rate limit, you'll get:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

## Testing Checklist

- [ ] Health check works
- [ ] API test endpoint works
- [ ] User registration works
- [ ] User login works
- [ ] JWT token is returned
- [ ] Protected routes work with valid token
- [ ] Protected routes fail without token
- [ ] Demo login works
- [ ] Demo data endpoints work
- [ ] Error handling works correctly
- [ ] Rate limiting works
- [ ] CORS is properly configured