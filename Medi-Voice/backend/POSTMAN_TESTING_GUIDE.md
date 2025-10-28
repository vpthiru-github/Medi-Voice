# MediHub Backend API Testing Guide

## 🚀 Getting Started

### Prerequisites
1. **Postman** installed on your computer
2. **Node.js** and **npm** installed
3. **MongoDB** running (local or cloud)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` file with your configuration:
   ```bash
   # Required Settings
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/medihub
   JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

Server should start at: `http://localhost:5000`

---

## 📋 Postman Collection Setup

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Copy and paste the JSON collection below (or save as `.json` file and import)

### Step 2: Set Environment Variables
Create a new environment in Postman with these variables:
- `baseURL`: `http://localhost:5000`
- `token`: (will be set automatically after login)
- `doctorId`: (will be set during testing)
- `patientId`: (will be set during testing)
- `appointmentId`: (will be set during testing)

---

## 🧪 Testing Sequence

### Phase 1: Authentication Testing

#### 1.1 User Registration
**POST** `{{baseURL}}/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "firstName": "Dr. John",
  "lastName": "Smith",
  "email": "doctor@example.com",
  "password": "Doctor123!",
  "confirmPassword": "Doctor123!",
  "role": "doctor",
  "phone": "+1234567890",
  "dateOfBirth": "1980-05-15",
  "gender": "male",
  "termsAccepted": true
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "firstName": "Dr. John",
      "lastName": "Smith",
      "email": "doctor@example.com",
      "role": "doctor"
    },
    "token": "jwt_token_here"
  }
}
```

#### 1.2 User Login
**POST** `{{baseURL}}/api/auth/login`

**Body (JSON):**
```json
{
  "email": "doctor@example.com",
  "password": "Doctor123!",
  "rememberMe": true
}
```

**Post-Response Script:**
```javascript
// Auto-save token for future requests
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
}
```

#### 1.3 Get User Profile
**GET** `{{baseURL}}/api/auth/me`

**Headers:**
```
Authorization: Bearer {{token}}
```

### Phase 2: Doctor Profile Management

#### 2.1 Create Doctor Profile
**POST** `{{baseURL}}/api/doctors/profile`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "specialization": "Cardiology",
  "licenseNumber": "MD123456",
  "department": "Cardiology Department",
  "qualifications": [
    {
      "degree": "MBBS",
      "institution": "Harvard Medical School",
      "year": 2005
    },
    {
      "degree": "MD Cardiology",
      "institution": "Johns Hopkins",
      "year": 2010
    }
  ],
  "yearsOfExperience": 15,
  "bio": "Experienced cardiologist specializing in interventional cardiology and heart disease prevention.",
  "consultationFee": 200,
  "consultationDuration": 30,
  "workingHours": {
    "monday": {
      "isWorking": true,
      "startTime": "09:00",
      "endTime": "17:00",
      "breakStart": "12:00",
      "breakEnd": "13:00"
    },
    "tuesday": {
      "isWorking": true,
      "startTime": "09:00",
      "endTime": "17:00",
      "breakStart": "12:00",
      "breakEnd": "13:00"
    },
    "wednesday": {
      "isWorking": true,
      "startTime": "09:00",
      "endTime": "17:00",
      "breakStart": "12:00",
      "breakEnd": "13:00"
    },
    "thursday": {
      "isWorking": true,
      "startTime": "09:00",
      "endTime": "17:00",
      "breakStart": "12:00",
      "breakEnd": "13:00"
    },
    "friday": {
      "isWorking": true,
      "startTime": "09:00",
      "endTime": "17:00",
      "breakStart": "12:00",
      "breakEnd": "13:00"
    },
    "saturday": {
      "isWorking": false
    },
    "sunday": {
      "isWorking": false
    }
  },
  "languages": ["English", "Spanish"],
  "acceptsNewPatients": true
}
```

#### 2.2 Get Doctor Profile
**GET** `{{baseURL}}/api/doctors/me/profile`

**Headers:**
```
Authorization: Bearer {{token}}
```

### Phase 3: Patient Registration & Management

#### 3.1 Register Patient User
**POST** `{{baseURL}}/api/auth/register`

**Body (JSON):**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "patient@example.com",
  "password": "Patient123!",
  "confirmPassword": "Patient123!",
  "role": "patient",
  "phone": "+1987654321",
  "dateOfBirth": "1990-03-20",
  "gender": "female",
  "termsAccepted": true
}
```

#### 3.2 Login as Patient
**POST** `{{baseURL}}/api/auth/login`

**Body (JSON):**
```json
{
  "email": "patient@example.com",
  "password": "Patient123!"
}
```

#### 3.3 Create Patient Profile
**POST** `{{baseURL}}/api/patients/profile`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "emergencyContact": {
    "name": "John Doe",
    "relationship": "Husband",
    "phone": "+1234567890",
    "email": "emergency@example.com"
  },
  "insurance": {
    "provider": "Blue Cross Blue Shield",
    "policyNumber": "BCBS123456",
    "groupNumber": "GRP789",
    "expiryDate": "2024-12-31",
    "copayAmount": 25,
    "deductible": 1000,
    "isActive": true
  },
  "medicalHistory": {
    "allergies": [
      {
        "allergen": "Penicillin",
        "severity": "severe",
        "reaction": "Anaphylaxis",
        "diagnosedDate": "2020-01-15"
      }
    ],
    "chronicConditions": [
      {
        "condition": "Hypertension",
        "diagnosedDate": "2019-06-10",
        "status": "controlled",
        "notes": "Well controlled with medication"
      }
    ],
    "currentMedications": [
      {
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "Once daily",
        "startDate": "2019-06-10",
        "isActive": true,
        "notes": "For blood pressure control"
      }
    ]
  },
  "vitals": {
    "bloodType": "O+",
    "height": {
      "value": 165,
      "unit": "cm"
    },
    "weight": {
      "value": 65,
      "unit": "kg"
    }
  }
}
```

### Phase 4: Appointment Management

#### 4.1 Get Available Doctors
**GET** `{{baseURL}}/api/doctors?specialization=Cardiology&page=1&limit=10`

#### 4.2 Check Doctor Availability
**GET** `{{baseURL}}/api/doctors/{{doctorId}}/availability?date=2024-12-20`

#### 4.3 Create Appointment (as Patient)
**POST** `{{baseURL}}/api/appointments`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "doctor": "{{doctorId}}",
  "scheduledTime": "2024-12-20T10:00:00.000Z",
  "appointmentType": "consultation",
  "duration": 30,
  "reasonForVisit": "Routine cardiac checkup and blood pressure monitoring",
  "symptoms": [
    {
      "symptom": "Chest tightness",
      "severity": "mild",
      "duration": "2 weeks",
      "notes": "Occurs during physical activity"
    }
  ]
}
```

#### 4.4 Get Patient Appointments
**GET** `{{baseURL}}/api/appointments`

**Headers:**
```
Authorization: Bearer {{token}}
```

### Phase 5: Medical Records & Prescriptions

#### 5.1 Create Medical Record (as Doctor)
**POST** `{{baseURL}}/api/medical-records`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "patient": "{{patientId}}",
  "appointment": "{{appointmentId}}",
  "recordType": "consultation",
  "title": "Cardiac Consultation",
  "description": "Patient presented with mild chest tightness during physical activity. Physical examination and ECG performed.",
  "visitDetails": {
    "chiefComplaint": "Chest tightness during exercise",
    "historyOfPresentIllness": "Patient reports mild chest tightness that occurs during moderate to vigorous physical activity. No chest pain at rest. No shortness of breath, palpitations, or syncope.",
    "physicalExamination": {
      "general": "Well-appearing patient in no acute distress",
      "vitals": {
        "bloodPressure": "130/85 mmHg",
        "heartRate": "72 bpm",
        "temperature": "98.6°F",
        "respiratoryRate": "16/min",
        "oxygenSaturation": "98%"
      },
      "cardiovascular": "Regular rate and rhythm, no murmurs, gallops, or rubs",
      "respiratory": "Clear to auscultation bilaterally"
    }
  },
  "diagnosis": [
    {
      "condition": "Mild exertional chest discomfort",
      "icdCode": "R06.02",
      "type": "primary",
      "severity": "mild",
      "status": "active"
    }
  ],
  "treatmentPlan": {
    "medications": [
      {
        "name": "Metoprolol",
        "dosage": "25mg",
        "frequency": "Twice daily",
        "duration": "3 months",
        "instructions": "Take with food"
      }
    ],
    "followUp": {
      "timeframe": "6 weeks",
      "reason": "Follow-up on symptoms and medication tolerance",
      "instructions": "Continue current medications, return if symptoms worsen"
    }
  }
}
```

#### 5.2 Create Prescription
**POST** `{{baseURL}}/api/prescriptions`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "patient": "{{patientId}}",
  "appointment": "{{appointmentId}}",
  "medications": [
    {
      "name": "Metoprolol Tartrate",
      "genericName": "Metoprolol",
      "brandName": "Lopressor",
      "strength": "25mg",
      "dosageForm": "tablet",
      "route": "oral",
      "frequency": "Twice daily",
      "dosage": "1 tablet",
      "duration": "90 days",
      "quantity": {
        "prescribed": 180,
        "unit": "tablets"
      },
      "instructions": "Take one tablet twice daily with food. Do not stop abruptly.",
      "indication": "Blood pressure control and cardiac protection",
      "refills": {
        "authorized": 2
      },
      "isGenericAllowed": true
    }
  ],
  "prescribedFor": "Hypertension and cardiac protection",
  "diagnosis": [
    {
      "condition": "Essential Hypertension",
      "icdCode": "I10"
    }
  ],
  "validUntil": "2025-03-20T00:00:00.000Z"
}
```

### Phase 6: Analytics & Reporting

#### 6.1 Doctor Analytics
**GET** `{{baseURL}}/api/doctors/me/analytics?period=30d`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### 6.2 Get Doctor's Patients
**GET** `{{baseURL}}/api/doctors/me/patients?page=1&limit=10`

#### 6.3 Get Doctor's Appointments
**GET** `{{baseURL}}/api/doctors/me/appointments?status=scheduled&page=1&limit=10`

---

## ⚡ Quick Test Scripts

### Auto-Login Script (for Environment)
```javascript
// Save this as a pre-request script for authenticated endpoints
const loginRequest = {
  url: pm.environment.get("baseURL") + "/api/auth/login",
  method: 'POST',
  header: {
    'Content-Type': 'application/json',
  },
  body: {
    mode: 'raw',
    raw: JSON.stringify({
      email: "doctor@example.com",
      password: "Doctor123!"
    })
  }
};

pm.sendRequest(loginRequest, function (err, response) {
  if (response.code === 200) {
    const responseJson = response.json();
    pm.environment.set("token", responseJson.data.token);
  }
});
```

### Response Validation Script
```javascript
// Add this to test scripts to validate responses
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Response has data field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
});
```

---

## 🔧 Error Testing

### Test Invalid Requests

#### 1. Invalid Authentication
**GET** `{{baseURL}}/api/auth/me`
- **Headers:** `Authorization: Bearer invalid_token`
- **Expected:** 401 Unauthorized

#### 2. Validation Errors
**POST** `{{baseURL}}/api/auth/register`
- **Body:** Missing required fields
- **Expected:** 400 Bad Request with validation errors

#### 3. Duplicate Registration
**POST** `{{baseURL}}/api/auth/register`
- **Body:** Same email as existing user
- **Expected:** 400 Bad Request

#### 4. Invalid Appointment Time
**POST** `{{baseURL}}/api/appointments`
- **Body:** Past date for scheduledTime
- **Expected:** 400 Bad Request

---

## 📊 Performance Testing

### Load Testing Recommendations
1. **User Registration:** 10 concurrent users
2. **Login:** 20 concurrent users
3. **Appointment Booking:** 5 concurrent users
4. **Medical Records:** 3 concurrent users

### Monitoring Endpoints
- **Health Check:** `GET {{baseURL}}/health`
- **API Status:** `GET {{baseURL}}/api/status`

---

## 🛠️ Troubleshooting

### Common Issues

1. **Server Not Starting**
   - Check MongoDB connection
   - Verify environment variables
   - Check port availability

2. **Authentication Failures**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Validate user credentials

3. **Database Errors**
   - Ensure MongoDB is running
   - Check connection string
   - Verify database permissions

4. **Validation Errors**
   - Check request body format
   - Verify required fields
   - Validate data types

### Debug Mode
Start server with debug logging:
```bash
NODE_ENV=development DEBUG=* npm run dev
```

---

## 📝 Test Checklist

- [ ] ✅ User registration (all roles)
- [ ] ✅ User login/logout
- [ ] ✅ Password reset flow
- [ ] ✅ Profile management
- [ ] ✅ Doctor profile creation
- [ ] ✅ Patient profile creation
- [ ] ✅ Appointment booking
- [ ] ✅ Appointment management
- [ ] ✅ Medical records creation
- [ ] ✅ Prescription management
- [ ] ✅ Search functionality
- [ ] ✅ Analytics endpoints
- [ ] ✅ Error handling
- [ ] ✅ Authentication middleware
- [ ] ✅ Validation middleware
- [ ] ✅ Role-based access control

---

## 🎯 Advanced Testing

### Integration Tests
1. **Complete Patient Journey**
   - Register → Profile → Book Appointment → Get Treatment
2. **Doctor Workflow**
   - Register → Profile → Manage Appointments → Create Records
3. **Administrative Tasks**
   - User management → Analytics → Reports

### Security Testing
1. **SQL Injection:** Test with malicious inputs
2. **XSS Prevention:** Test script inputs
3. **Rate Limiting:** Test rapid requests
4. **Authentication Bypass:** Test without tokens

This comprehensive testing guide should help you thoroughly test all aspects of the MediHub backend API! 🚀