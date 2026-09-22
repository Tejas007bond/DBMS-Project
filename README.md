# CarePulse Hospital Management System (Oracle SQL Enterprise)

A full-stack, enterprise-grade Hospital Management System built with **Python Flask**, **python-oracledb**, and **Oracle Database 11g XE / 19c / 21c / 23ai**.

---

## 🌟 Key Features

1. **Live Synchronized Dashboard**: High-level KPI metric cards showing real-time statistics aggregated directly from the Oracle database.
2. **Normalized Schema (18 Tables)**:
   - **Room Chain**: `ROOMS_B` & `ROOMS`
   - **Employee Subclasses**: `EMPLOYEE`, `DOCTOR` (recursive supervision), `NURSE` (shift scheduling), `PHARMACIST` (clearance levels)
   - **Patient Chain**: `PATIENT_C` (Address & Room), `PATIENT_B` (Phone), `PATIENT` (Demographics & Admission)
   - **Weak Entities**: `PERSONS` (Dependents), `TEST_REPORT` (Diagnostics), `VALID` (Insurance check), `BILLS` (Invoices)
   - **M:N & Associations**: `MEDICAL_RECORDS`, `RECORD_HANDLER`, `APPOINTMENT`, `Appointment_B`, `NURSE_HANDLES_ROOMS`
3. **5 Core EER Demonstration Queries**:
   - **1. Basic Filtering (`WHERE`)**: General room numbers and capacities.
   - **2. Finding Missing Data (`IS NULL`)**: Currently admitted inpatient identification.
   - **3. Simple Aggregation (`GROUP BY`)**: Nurse count by shift type.
   - **4. Sorting Data (`ORDER BY`)**: Employees over age 40 sorted by age descending.
   - **5. Simple 2-Table JOIN**: Pharmacist employee details with clearance levels.
4. **Interactive SQL Console**: Run arbitrary custom `SELECT` queries on the database with live execution metrics (ms latency, row count).
5. **Entity Directories**: Dedicated interactive views for Patients (with admission filter), Doctors, Nurses, Pharmacists, Rooms/Wards, Billing, and Appointments/Tests.

---

## 🚀 Quick Start Guide

### 1. Requirements
- Python 3.9+
- Oracle Database (e.g. Oracle Database 11g Express Edition / Oracle 19c)
- Oracle Instant Client (configured for Thick mode support)

### 2. Configure Database Credentials
Edit the `.env` file in the project root:
```env
ORACLE_USER=SHUBHAM
ORACLE_PASSWORD=YourOraclePassword
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XE

FLASK_PORT=5000
FLASK_DEBUG=True
```

### 3. Initialize / Seed Database
Run the automated schema and data initialization script:
```bash
python init_db.py
```

### 4. Start the Application
Run the Flask server:
```bash
python app.py
```
Or double-click `start.bat`.

### 5. Access the Web App
Open your browser at:
```
http://127.0.0.1:5000
```

---

## 📁 Project Structure

```
Hospital Management system/
├── app.py              # Flask server and REST API endpoints
├── config.py           # Environment and DB configuration loader
├── db.py               # Oracle connection manager and query helper functions
├── init_db.py          # Database DDL recreation & data seeding script
├── schema.sql          # Complete Oracle SQL script (DDL + Inserts + 5 Queries)
├── requirements.txt    # Python dependencies (Flask, python-oracledb, python-dotenv)
├── start.bat           # Quick launcher script for Windows
├── .env                # Database credentials
├── templates/
│   └── index.html      # Main dashboard and module UI template
└── static/
    ├── css/
    │   └── style.css   # Enterprise healthcare design system
    └── js/
        └── app.js      # Frontend controller and live API integration
```
