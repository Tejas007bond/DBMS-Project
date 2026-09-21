// Database schema for Hospital Management System
// Creates all 18 tables matching the EER diagram

export const createSchema = `
-- 1. ROOMS_B (Capacity, Availability)
CREATE TABLE IF NOT EXISTS ROOMS_B (
    Capacity INTEGER PRIMARY KEY,
    Availability TEXT
);

-- 2. ROOMS (Room_no, Capacity, Type)
CREATE TABLE IF NOT EXISTS ROOMS (
    Room_no INTEGER PRIMARY KEY,
    Capacity INTEGER,
    Type TEXT,
    FOREIGN KEY (Capacity) REFERENCES ROOMS_B(Capacity)
);

-- 3. EMPLOYEE (Emp_id, F_name, L_name, Gender, Address, Contact_no, Age)
CREATE TABLE IF NOT EXISTS EMPLOYEE (
    Emp_id INTEGER PRIMARY KEY,
    F_name TEXT,
    L_name TEXT,
    Gender TEXT,
    Address TEXT,
    Contact_no TEXT,
    Age INTEGER
);

-- 4. PATIENT_C (Address, Room_no)
CREATE TABLE IF NOT EXISTS PATIENT_C (
    Address TEXT PRIMARY KEY,
    Room_no INTEGER,
    FOREIGN KEY (Room_no) REFERENCES ROOMS(Room_no)
);

-- 5. PATIENT_B (Phone, Address)
CREATE TABLE IF NOT EXISTS PATIENT_B (
    Phone TEXT PRIMARY KEY,
    Address TEXT,
    FOREIGN KEY (Address) REFERENCES PATIENT_C(Address)
);

-- 6. PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date)
CREATE TABLE IF NOT EXISTS PATIENT (
    Patient_id INTEGER PRIMARY KEY,
    F_name TEXT,
    L_name TEXT,
    Gender TEXT,
    Phone TEXT,
    In_date DATE,
    Out_date DATE,
    FOREIGN KEY (Phone) REFERENCES PATIENT_B(Phone)
);

-- 7. DOCTOR (Emp_id, Specialization, Designation, Supervisor_id)
CREATE TABLE IF NOT EXISTS DOCTOR (
    Emp_id INTEGER PRIMARY KEY,
    Specialization TEXT,
    Designation TEXT,
    Supervisor_id INTEGER,
    FOREIGN KEY (Emp_id) REFERENCES EMPLOYEE(Emp_id),
    FOREIGN KEY (Supervisor_id) REFERENCES DOCTOR(Emp_id)
);

-- 8. NURSE (Emp_id, Shift_type)
CREATE TABLE IF NOT EXISTS NURSE (
    Emp_id INTEGER PRIMARY KEY,
    Shift_type TEXT,
    FOREIGN KEY (Emp_id) REFERENCES EMPLOYEE(Emp_id)
);

-- 9. PHARMACIST (Emp_id, Clearance_level)
CREATE TABLE IF NOT EXISTS PHARMACIST (
    Emp_id INTEGER PRIMARY KEY,
    Clearance_level TEXT,
    FOREIGN KEY (Emp_id) REFERENCES EMPLOYEE(Emp_id)
);

-- 10. PERSONS (Patient_id, Name, Sex, Age, Relationship)
CREATE TABLE IF NOT EXISTS PERSONS (
    Patient_id INTEGER,
    Name TEXT,
    Sex TEXT,
    Age INTEGER,
    Relationship TEXT,
    PRIMARY KEY (Patient_id, Name),
    FOREIGN KEY (Patient_id) REFERENCES PATIENT(Patient_id)
);

-- 11. TEST_REPORT (R_id, Patient_id, Test_type, Result)
CREATE TABLE IF NOT EXISTS TEST_REPORT (
    R_id INTEGER,
    Patient_id INTEGER,
    Test_type TEXT,
    Result TEXT,
    PRIMARY KEY (R_id, Patient_id),
    FOREIGN KEY (Patient_id) REFERENCES PATIENT(Patient_id)
);

-- 12. VALID (P_id, Valid)
CREATE TABLE IF NOT EXISTS VALID (
    P_id INTEGER PRIMARY KEY,
    Valid TEXT,
    FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id)
);

-- 13. BILLS (B_id, P_id, Amount, I_amount)
CREATE TABLE IF NOT EXISTS BILLS (
    B_id INTEGER,
    P_id INTEGER,
    Amount DECIMAL(10, 2),
    I_amount DECIMAL(10, 2),
    PRIMARY KEY (B_id, P_id),
    FOREIGN KEY (P_id) REFERENCES VALID(P_id)
);

-- 14. MEDICAL_RECORDS (R_id, P_id, Purchase_date)
CREATE TABLE IF NOT EXISTS MEDICAL_RECORDS (
    R_id INTEGER,
    P_id INTEGER,
    Purchase_date DATE,
    PRIMARY KEY (R_id, P_id),
    FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id)
);

-- 15. RECORD_HANDLER (P_id, Purchase_date, Emp_id)
CREATE TABLE IF NOT EXISTS RECORD_HANDLER (
    P_id INTEGER,
    Purchase_date DATE,
    Emp_id INTEGER,
    PRIMARY KEY (P_id, Purchase_date, Emp_id),
    FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id),
    FOREIGN KEY (Emp_id) REFERENCES PHARMACIST(Emp_id)
);

-- 16. APPOINTMENT (Id, App_date, P_id)
CREATE TABLE IF NOT EXISTS APPOINTMENT (
    Id INTEGER PRIMARY KEY,
    App_date DATE,
    P_id INTEGER,
    FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id)
);

-- 17. Appointment_B (P_id, D_id)
CREATE TABLE IF NOT EXISTS Appointment_B (
    P_id INTEGER,
    D_id INTEGER,
    PRIMARY KEY (P_id, D_id),
    FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id),
    FOREIGN KEY (D_id) REFERENCES DOCTOR(Emp_id)
);

-- 18. NURSE_HANDLES_ROOMS (Emp_id, Room_no)
CREATE TABLE IF NOT EXISTS NURSE_HANDLES_ROOMS (
    Emp_id INTEGER,
    Room_no INTEGER,
    PRIMARY KEY (Emp_id, Room_no),
    FOREIGN KEY (Emp_id) REFERENCES NURSE(Emp_id),
    FOREIGN KEY (Room_no) REFERENCES ROOMS(Room_no)
);
`;
