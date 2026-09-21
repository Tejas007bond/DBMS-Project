# Hospital Management System - Backend API

A RESTful API backend for the Hospital Management System, built with Express.js and SQLite.

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or later

### Installation

```bash
cd backend
npm install
```

### Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## 🗄️ Database

The backend uses **SQLite** via `sql.js` (pure JavaScript, no native dependencies required).

- Database file: `backend/db/hospital.db`
- Schema: 18 tables matching the EER diagram
- Seed data: Automatically populated on first run

### Database Tables

| Table | Description |
|-------|-------------|
| EMPLOYEE | Base employee entity |
| DOCTOR | Doctor subclass |
| NURSE | Nurse subclass |
| PHARMACIST | Pharmacist subclass |
| PATIENT | Patient entity |
| PATIENT_B | Patient phone/address |
| PATIENT_C | Patient address/room |
| ROOMS | Room entity |
| ROOMS_B | Room availability |
| PERSONS | Patient dependents |
| TEST_REPORT | Test reports |
| VALID | Insurance validation |
| BILLS | Patient bills |
| MEDICAL_RECORDS | Medical records |
| RECORD_HANDLER | Pharmacist-record relationship |
| APPOINTMENT | Appointments |
| APPOINTMENT_B | Patient-doctor appointments |
| NURSE_HANDLES_ROOMS | Nurse-room assignments |

## 📡 API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Health Check
```
GET /api/health
```

### Dashboard
```
GET /api/dashboard              # Get all statistics
GET /api/dashboard/admissions   # Get admission dates
GET /api/dashboard/discharges   # Get discharge dates
```

### Employees
```
GET    /api/employees           # Get all employees
GET    /api/employees/:id       # Get employee by ID
POST   /api/employees           # Create new employee
PUT    /api/employees/:id       # Update employee
DELETE /api/employees/:id       # Delete employee
```

### Doctors
```
GET    /api/doctors             # Get all doctors with employee info
GET    /api/doctors/:id         # Get doctor by ID
POST   /api/doctors             # Create new doctor (also creates employee)
PUT    /api/doctors/:id         # Update doctor
DELETE /api/doctors/:id         # Delete doctor
```

### Nurses
```
GET    /api/nurses              # Get all nurses with employee info
GET    /api/nurses/:id          # Get nurse by ID
POST   /api/nurses              # Create new nurse (also creates employee)
PUT    /api/nurses/:id          # Update nurse
DELETE /api/nurses/:id          # Delete nurse
GET    /api/nurses/:id/rooms    # Get nurse's assigned rooms
POST   /api/nurses/:id/rooms    # Assign nurse to room
DELETE /api/nurses/:id/rooms/:roomNo  # Remove nurse from room
GET    /api/nurses/stats/shifts # Get nurse shift distribution
```

### Pharmacists
```
GET    /api/pharmacists         # Get all pharmacists with employee info
GET    /api/pharmacists/:id     # Get pharmacist by ID
POST   /api/pharmacists         # Create new pharmacist (also creates employee)
PUT    /api/pharmacists/:id     # Update pharmacist
DELETE /api/pharmacists/:id     # Delete pharmacist
GET    /api/pharmacists/:id/records  # Get pharmacist's handled records
```

### Patients
```
GET    /api/patients            # Get all patients with full details
GET    /api/patients/:id        # Get patient by ID
POST   /api/patients            # Create new patient
PUT    /api/patients/:id        # Update patient
DELETE /api/patients/:id        # Delete patient
GET    /api/patients/:id/dependents  # Get patient's dependents
GET    /api/patients/consultations   # Get patient-doctor consultations
GET    /api/patients/admitted/current  # Get currently admitted patients
```

### Rooms
```
GET    /api/rooms               # Get all rooms with availability
GET    /api/rooms/:roomNo       # Get room by number
POST   /api/rooms               # Create new room
PUT    /api/rooms/:roomNo       # Update room
DELETE /api/rooms/:roomNo       # Delete room
GET    /api/rooms/:roomNo/patients  # Get patients in room
GET    /api/rooms/:roomNo/nurses    # Get nurses assigned to room
```

### Appointments
```
GET    /api/appointments        # Get all appointments
GET    /api/appointments/:id    # Get appointment by ID
POST   /api/appointments        # Create new appointment
PUT    /api/appointments/:id    # Update appointment
DELETE /api/appointments/:id    # Delete appointment
```

### Bills
```
GET    /api/bills               # Get all bills with insurance info
GET    /api/bills/:id/:patientId  # Get bill by ID
POST   /api/bills               # Create new bill
PUT    /api/bills/:id/:patientId  # Update bill
DELETE /api/bills/:id/:patientId  # Delete bill
GET    /api/bills/stats/above-average  # Get bills above average
GET    /api/bills/patient/:patientId   # Get patient bills summary
```

### Test Reports
```
GET    /api/test-reports        # Get all test reports
GET    /api/test-reports/:rId/:patientId  # Get report by ID
POST   /api/test-reports        # Create new report
PUT    /api/test-reports/:rId/:patientId  # Update report
DELETE /api/test-reports/:rId/:patientId  # Delete report
GET    /api/test-reports/patient/:patientId  # Get reports for patient
```

### Medical Records
```
GET    /api/medical-records     # Get all medical records
GET    /api/medical-records/:rId/:patientId  # Get record by ID
POST   /api/medical-records     # Create new record
PUT    /api/medical-records/:rId/:patientId  # Update record
DELETE /api/medical-records/:rId/:patientId  # Delete record
GET    /api/medical-records/patient/:patientId  # Get records for patient
```

### Persons (Dependents)
```
GET    /api/persons             # Get all dependents
GET    /api/persons/:patientId/:name  # Get person by patient and name
POST   /api/persons             # Create new dependent
PUT    /api/persons/:patientId/:name  # Update dependent
DELETE /api/persons/:patientId/:name  # Delete dependent
GET    /api/persons/patient/:patientId  # Get dependents for patient
```

### Valid (Insurance)
```
GET    /api/valid               # Get all validation records
GET    /api/valid/:patientId    # Get validation for patient
POST   /api/valid               # Create validation record
PUT    /api/valid/:patientId    # Update validation
DELETE /api/valid/:patientId    # Delete validation
```

## 📝 Example Requests

### Create a new patient
```bash
curl -X POST http://localhost:3001/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "Patient_id": 1007,
    "F_name": "John",
    "L_name": "Doe",
    "Gender": "M",
    "Phone": "555-2007",
    "In_date": "2026-09-20",
    "Address": "123 Main St",
    "Room_no": 101,
    "Valid": "Yes"
  }'
```

### Get all doctors
```bash
curl http://localhost:3001/api/doctors
```

### Get dashboard statistics
```bash
curl http://localhost:3001/api/dashboard
```

## 🏗️ Project Structure

```
backend/
├── db/
│   ├── index.js          # Database initialization
│   ├── schema.js         # Table schemas
│   ├── seed.js           # Seed data
│   ├── wrapper.js        # API wrapper for sql.js
│   └── hospital.db       # SQLite database file
├── routes/
│   ├── employees.js      # Employee routes
│   ├── doctors.js        # Doctor routes
│   ├── nurses.js         # Nurse routes
│   ├── pharmacists.js    # Pharmacist routes
│   ├── patients.js       # Patient routes
│   ├── rooms.js          # Room routes
│   ├── appointments.js   # Appointment routes
│   ├── bills.js          # Bill routes
│   ├── testReports.js    # Test report routes
│   ├── medicalRecords.js # Medical record routes
│   ├── persons.js        # Person/dependent routes
│   ├── valid.js          # Validation routes
│   └── dashboard.js      # Dashboard stats routes
├── package.json
├── server.js             # Express server entry point
└── README.md             # This file
```

## 🔧 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (via sql.js)
- **CORS**: Enabled for frontend development

## 📝 License

Educational project - free to use for coursework and learning.
