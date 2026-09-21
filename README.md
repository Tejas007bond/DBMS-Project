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
Any standards-compliant RDBMS: **Oracle**, **MySQL**, **PostgreSQL**, or **SQLite 3.9+**.

### Setup
1. Open your SQL client (SQL*Plus, MySQL Workbench, pgAdmin, DBeaver, etc.).
2. Run the DDL section (Section 1–5) of `hospital management system code.txt` to create all tables.
3. Run the seed-data section to populate the hospital with sample employees, patients, rooms, bills and records.
4. Run any of the 17 sample queries to explore the data.

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
- **SQL** (ANSI-compatible, tested patterns for Oracle / MySQL / PostgreSQL)
- **EER modeling** with specialization/weak-entity mapping

## 📄 License
Educational project — free to use for coursework and learning.
