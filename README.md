# DBMS-Project: Hospital Management System

A complete **Database Management System (DBMS)** project implementing the backend schema for a Hospital Management System, designed from a hand-drawn **Enhanced Entity-Relationship (EER) diagram**.

---

## 📐 EER Diagram

The hand-drawn EER diagram (2 pages):

| Page 1 | Page 2 |
| :---: | :---: |
| ![ER Diagram Page 1](er_diagram_page1.jpg) | ![ER Diagram Page 2](er_diagram_page2.jpg) |

---

## 🗂️ Project Structure

```
.
├── frontend/                          # React frontend application
│   ├── src/
│   │   ├── api/                       # API service layer for backend communication
│   │   ├── components/                # Reusable UI components (Layout, DataTable, etc.)
│   │   ├── data/                      # Mock data matching the SQL schema
│   │   ├── pages/                     # Page components (Dashboard, Patients, etc.)
│   │   ├── App.jsx                    # Root component with routing
│   │   ├── main.jsx                   # Entry point
│   │   └── index.css                  # Tailwind CSS styles
│   ├── index.html                     # HTML template
│   ├── vite.config.js                 # Vite configuration (with API proxy)
│   └── package.json                   # Frontend dependencies
├── backend/                           # Express.js backend API
│   ├── db/                            # Database layer (SQLite)
│   │   ├── index.js                   # Database initialization
│   │   ├── schema.js                  # Table schemas (18 tables)
│   │   ├── seed.js                    # Seed data
│   │   └── wrapper.js                 # API wrapper for sql.js
│   ├── routes/                        # API routes for all entities
│   │   ├── employees.js               # Employee CRUD
│   │   ├── doctors.js                 # Doctor CRUD
│   │   ├── nurses.js                  # Nurse CRUD
│   │   ├── pharmacists.js             # Pharmacist CRUD
│   │   ├── patients.js                # Patient CRUD
│   │   ├── rooms.js                   # Room CRUD
│   │   ├── appointments.js            # Appointment CRUD
│   │   ├── bills.js                   # Bill CRUD
│   │   ├── testReports.js             # Test Report CRUD
│   │   ├── medicalRecords.js          # Medical Record CRUD
│   │   ├── persons.js                 # Person/Dependent CRUD
│   │   ├── valid.js                   # Insurance Validation CRUD
│   │   └── dashboard.js               # Dashboard statistics
│   ├── package.json                   # Backend dependencies
│   ├── server.js                      # Express server entry point
│   └── README.md                      # Backend API documentation
├── er_diagram_page1.jpg               # EER diagram (page 1)
├── er_diagram_page2.jpg               # EER diagram (page 2)
├── hospital management system code.txt # Full SQL script (DDL + seed data + 17 queries)
└── README.md                          # This file
```

---

## 🏥 EER Design Overview

### Strong Entities
| Entity | Attributes | Notes |
|---|---|---|
| **EMPLOYEE** | Emp_id (PK), F_name, L_name, Gender, Address, Contact_no, Age | Base entity of the specialization hierarchy |
| **PATIENT** | Patient_id (PK), F_name, L_name, Gender, Phone, In_date, Out_date | |
| **ROOMS** | Room_no (PK), Capacity, Type | Capacity → ROOMS_B |

### EER Specialization (is-a) — Disjoint, Total
`EMPLOYEE` is specialized into three subclasses, each sharing the primary key `Emp_id`:

- **DOCTOR** — Specialization, Designation, Supervisor_id
- **NURSE** — Shift_type
- **PHARMACIST** — Clearance_level

### Weak Entities (identifying relationship with PATIENT)
| Weak Entity | Partial Key | Identifying Relationship |
|---|---|---|
| **PERSONS** (dependents) | Name | Dependent_On |
| **TEST_REPORT** | R_id | Has |
| **BILLS** | B_id | Pays |

### Relationships
| Relationship | Entities | Cardinality | Implementation |
|---|---|---|---|
| **resides** | PATIENT – ROOMS | N:1 | `PATIENT_C.Room_no` FK chain |
| **Supervision** | DOCTOR – DOCTOR | Recursive | `DOCTOR.Supervisor_id` self-FK |
| **handles** | NURSE – ROOMS | M:N | `NURSE_HANDLES_ROOMS` |
| **Consulted_by** | PATIENT – DOCTOR | M:N | `Appointment_B` |
| **Maintains** | PHARMACIST – MEDICAL_RECORDS | 1:N | `RECORD_HANDLER` |
| **is_handled / Appointment** | PATIENT – APPOINTMENT | 1:N | `APPOINTMENT.P_id` FK |

### Normalization Chains
The design is normalized to **3NF** using transitive-attribute tables:

```
ROOMS_B (Capacity, Availability)  ←  ROOMS (Room_no, Capacity, Type)
PATIENT (Patient_id, ...) ← PATIENT_B (Phone, Address) ← PATIENT_C (Address, Room_no)
VALID (P_id, Valid) ← BILLS (B_id, P_id, Amount, I_amount)
```

---

## 🚀 Getting Started

### Prerequisites

Before running this project, ensure you have the following installed:

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | 18 or later | [nodejs.org](https://nodejs.org/) |
| **npm** | 9 or later | Included with Node.js |

To verify your installation, run:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

---

### Quick Start (Recommended)

Run both frontend and backend together using **two terminal windows**:

**Terminal 1 - Start Backend:**
```bash
cd backend
npm install
npm run dev
```
Wait for: `Hospital Management System API running on http://localhost:3001`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Wait for: `Local: http://localhost:5173/`

Then open **http://localhost:5173** in your browser.

---

### Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd DBMS-Project
```

#### 2. Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server (development mode with auto-reload)
npm run dev
```

The backend server will:
- Create a SQLite database at `backend/db/hospital.db`
- Initialize all 18 tables automatically
- Seed the database with sample data
- Start listening on port 3001

You should see:
```
Database already initialized.  (or "Creating database schema...")
Database initialized successfully
Hospital Management System API running on http://localhost:3001
```

#### 3. Set Up Frontend

Open a **new terminal window**, then:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

You should see:
```
VITE v8.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

#### 4. Access the Application

Open your browser and navigate to:
- **Frontend UI:** http://localhost:5173
- **Backend API:** http://localhost:3001/api/health

---

### Backend Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install backend dependencies |
| `npm run dev` | Start server with auto-reload (development) |
| `npm start` | Start server (production) |

### Frontend Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install frontend dependencies |
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production (output in `dist/`) |
| `npm run preview` | Preview the production build locally |

---

### Testing the API

Once the backend is running, you can test the API endpoints:

```bash
# Health check
curl http://localhost:3001/api/health

# Get all patients
curl http://localhost:3001/api/patients

# Get all doctors
curl http://localhost:3001/api/doctors

# Get dashboard statistics
curl http://localhost:3001/api/dashboard
```

Or open these URLs directly in your browser:
- http://localhost:3001/api/health
- http://localhost:3001/api/patients
- http://localhost:3001/api/doctors
- http://localhost:3001/api/dashboard

---

### Troubleshooting

#### Port Already in Use
If port 3001 or 5173 is already in use:

```bash
# Find process using the port (Windows)
netstat -ano | findstr :3001

# Find process using the port (Mac/Linux)
lsof -i :3001

# Kill the process or change the port in:
# - Backend: backend/server.js (change PORT variable)
# - Frontend: frontend/vite.config.js (change server.port)
```

#### Database Issues
If you encounter database errors:

```bash
# Delete the database file to reset
rm backend/db/hospital.db

# Restart the backend server
cd backend
npm run dev
```

#### Node Module Issues
If you encounter dependency errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Running the SQL Script (Alternative)

If you want to use a different database (Oracle, MySQL, PostgreSQL):

1. Open your SQL client (SQL*Plus, MySQL Workbench, pgAdmin, DBeaver, etc.).
2. Open `hospital management system code.txt`, **select all → copy → paste into the SQL editor → execute**.
3. Every line in the file is valid SQL: all headings and explanations are SQL comments (`--`), so nothing throws a syntax error.
4. The script creates all 18 tables, inserts seed data, and runs all 17 sample queries in order.

> **MySQL users:** two dialect notes — queries 6, 9, 12, 14, 17 use `||` concatenation (MySQL needs `CONCAT(a, b)`), and query 16 uses `(Out_date - In_date)` (MySQL needs `DATEDIFF(Out_date, In_date)`). Query 15's integer division `I_amount/Amount` also differs on MySQL — wrap as `(I_amount * 100.0 / Amount)`. Everything else runs as-is.

### Re-runnability tip
If your RDBMS supports it, wrap the DDL with drop statements so the script can be replayed:

```sql
DROP TABLE NURSE_HANDLES_ROOMS, Appointment_B, RECORD_HANDLER, MEDICAL_RECORDS,
           APPOINTMENT, BILLS, VALID, TEST_REPORT, PERSONS,
           DOCTOR, NURSE, PHARMACIST,
           PATIENT, PATIENT_B, PATIENT_C,
           ROOMS, ROOMS_B, EMPLOYEE;
```

*(Drop children before parents so foreign-key constraints don't block the drops.)*

---

## 📡 API Endpoints

The backend provides a complete RESTful API for all entities:

| Entity | Endpoint | Methods |
|---|---|---|
| Health Check | `/api/health` | GET |
| Dashboard | `/api/dashboard` | GET |
| Employees | `/api/employees` | GET, POST, PUT, DELETE |
| Doctors | `/api/doctors` | GET, POST, PUT, DELETE |
| Nurses | `/api/nurses` | GET, POST, PUT, DELETE |
| Pharmacists | `/api/pharmacists` | GET, POST, PUT, DELETE |
| Patients | `/api/patients` | GET, POST, PUT, DELETE |
| Rooms | `/api/rooms` | GET, POST, PUT, DELETE |
| Appointments | `/api/appointments` | GET, POST, PUT, DELETE |
| Bills | `/api/bills` | GET, POST, PUT, DELETE |
| Test Reports | `/api/test-reports` | GET, POST, PUT, DELETE |
| Medical Records | `/api/medical-records` | GET, POST, PUT, DELETE |
| Persons (Dependents) | `/api/persons` | GET, POST, PUT, DELETE |
| Valid (Insurance) | `/api/valid` | GET, POST, PUT, DELETE |

For detailed API documentation, see [backend/README.md](backend/README.md).

---

## 🔍 Sample Query Catalog

The script contains **17 worked-out queries**, each with an explanation:

| # | Concept | ER Feature Exercised |
|---|---|---|
| 1 | `WHERE` filtering | ROOMS entity |
| 2 | `IS NULL` | PATIENT admission status |
| 3 | `GROUP BY` aggregation | NURSE subclass |
| 4 | `ORDER BY` sorting | EMPLOYEE base entity |
| 5 | Simple 2-table join | Specialization (EMPLOYEE ⋈ PHARMACIST) |
| 6 | 4-table join | Consulted_by M:N relationship |
| 7 | `LEFT JOIN` | PATIENT left outer join BILLS |
| 8 | `HAVING` clause | BILLS aggregation |
| 9 | Recursive self-join | Supervision relationship |
| 10 | `IN` subquery | PERSONS weak entity |
| 11 | Aggregate subquery | BILLS vs. average |
| 12 | 5-table join | Nurse handles Rooms M:N |
| 13 | `EXISTS` correlated subquery | TEST_REPORT weak entity |
| 14 | Composite-key join | MEDICAL_RECORDS / RECORD_HANDLER |
| 15 | `CASE` expression | Derived column on BILLS |
| 16 | Date arithmetic | Length of hospital stay |
| 17 | `CREATE VIEW` | Reusable current-in-patient view |

---

## 🧱 Schema Map

```
                 ┌────────────┐  is-a (disjoint, total)   ┌──────────┐
                 │  EMPLOYEE  │◄─────────────────────────►│  DOCTOR  │──┐ Supervision (recursive)
                 └────────────┘                           └──────────┘◄─┘
                        ▲ is-a                        is-a ▲      ▲
                        │                                  │      │
                   ┌─────────┐   handles (M:N)   ┌────────┐ │      │
                   │  NURSE  │◄──────────────────►│ ROOMS  │ │ ┌────────────┐
                   └─────────┘                    └────────┘ │ │ PHARMACIST │
                                                             │ └────────────┘
        ┌─────────┐  resides (N:1)   ┌────────┐  Maintains │ 1:N  ┌─────────────────┐
        │ PATIENT │◄────────────────►│ ROOMS  │◄───────────┴──────┤ MEDICAL_RECORDS │
        └─────────┘                  └────────┘                   └─────────────────┘
             ▲ weak: PERSONS, TEST_REPORT, BILLS, APPOINTMENT (identifying rel.)
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite 8
- **Tailwind CSS 4** for styling
- **React Router 7** for client-side routing
- **Lucide React** for icons

### Backend
- **Node.js** runtime
- **Express.js** framework
- **SQLite** database (via sql.js)
- **CORS** enabled for development

### Database
- **SQL** (ANSI-compatible, tested patterns for Oracle / MySQL / PostgreSQL)
- **EER modeling** with specialization/weak-entity mapping

## 📄 License
Educational project — free to use for coursework and learning.
