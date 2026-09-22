"""
Oracle Database Connection Helper Module
Manages establishing connections, testing connectivity, and executing queries against the Oracle SQL database.
"""

import oracledb
import os
from datetime import datetime, date
from decimal import Decimal
from config import Config

def _init_thick_mode():
    """
    Initialize python-oracledb in Thick mode using Oracle Instant Client / Oracle XE libraries.
    """
    oracle_client_path = r"C:\oracle\instantclient_19_32"
    if os.path.isdir(oracle_client_path):
        try:
            oracledb.init_oracle_client(lib_dir=oracle_client_path)
        except Exception:
            pass
    else:
        try:
            oracledb.init_oracle_client()
        except Exception:
            pass

_init_thick_mode()


def get_connection():
    """Establish and return an active connection to Oracle DB."""
    if not Config.is_configured():
        raise ValueError("Oracle credentials are not configured in .env.")
    
    dsn = f"{Config.ORACLE_HOST}:{Config.ORACLE_PORT}/{Config.ORACLE_SERVICE_NAME}"
    return oracledb.connect(
        user=Config.ORACLE_USER,
        password=Config.ORACLE_PASSWORD,
        dsn=dsn
    )


def test_connection():
    """Tests the connection to Oracle DB and returns status info."""
    if not Config.is_configured():
        return {
            "connected": False,
            "status": "not_configured",
            "message": "Database credentials are not configured in .env.",
            "details": {
                "host": Config.ORACLE_HOST,
                "port": Config.ORACLE_PORT,
                "service_name": Config.ORACLE_SERVICE_NAME,
                "user": Config.ORACLE_USER or "(empty)"
            }
        }

    try:
        connection = get_connection()
        db_version = connection.version
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM DUAL")
            cursor.fetchone()
        connection.close()

        return {
            "connected": True,
            "status": "connected",
            "message": "Successfully connected to Oracle Database.",
            "details": {
                "version": db_version,
                "host": Config.ORACLE_HOST,
                "port": Config.ORACLE_PORT,
                "service_name": Config.ORACLE_SERVICE_NAME,
                "user": Config.ORACLE_USER
            }
        }
    except oracledb.Error as err:
        error_obj, = err.args
        return {
            "connected": False,
            "status": "connection_error",
            "message": f"Oracle Database Connection Failed: {getattr(error_obj, 'message', str(err))}",
            "details": {
                "error_code": getattr(error_obj, "code", None),
                "host": Config.ORACLE_HOST,
                "port": Config.ORACLE_PORT,
                "service_name": Config.ORACLE_SERVICE_NAME,
                "user": Config.ORACLE_USER
            }
        }
    except Exception as exc:
        return {
            "connected": False,
            "status": "error",
            "message": f"Unexpected error while connecting: {str(exc)}",
            "details": {
                "host": Config.ORACLE_HOST,
                "port": Config.ORACLE_PORT,
                "service_name": Config.ORACLE_SERVICE_NAME,
                "user": Config.ORACLE_USER
            }
        }


def _serialize_val(val):
    """Format dates, timestamps, decimals for clean JSON response."""
    if isinstance(val, (datetime, date)):
        return val.strftime("%Y-%m-%d")
    if isinstance(val, Decimal):
        return float(val)
    return val


def execute_query(sql, params=None):
    """
    Executes a SELECT query and returns a list of dictionaries with column names as keys.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params or {})
        if cursor.description:
            columns = [col[0].lower() for col in cursor.description]
            raw_rows = cursor.fetchall()
            results = []
            for row in raw_rows:
                results.append({col: _serialize_val(val) for col, val in zip(columns, row)})
            return results
        return []
    finally:
        conn.close()


def execute_custom_query(sql):
    """
    Executes an arbitrary user-submitted SQL query safely (SELECT queries only).
    Returns columns, rows, and execution metrics.
    """
    cleaned_sql = sql.strip().rstrip(";")
    if not cleaned_sql.lower().startswith("select"):
        raise ValueError("Only SELECT queries are allowed in this interface for security.")

    conn = get_connection()
    try:
        cursor = conn.cursor()
        start_time = datetime.now()
        cursor.execute(cleaned_sql)
        duration_ms = (datetime.now() - start_time).total_seconds() * 1000
        
        columns = [col[0] for col in cursor.description] if cursor.description else []
        raw_rows = cursor.fetchall()
        
        rows = []
        for r in raw_rows:
            rows.append([_serialize_val(v) for v in r])
            
        return {
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
            "duration_ms": round(duration_ms, 2)
        }
    finally:
        conn.close()


# =========================================================================
# Domain Queries for Hospital Entities
# =========================================================================

def get_dashboard_summary():
    """Aggregates high-level hospital KPI statistics from live Oracle tables."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # Patients count & Active Admitted
        cur.execute("SELECT COUNT(*) FROM PATIENT")
        total_patients = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM PATIENT WHERE Out_date IS NULL")
        active_patients = cur.fetchone()[0]
        
        # Doctors, Nurses, Pharmacists, Employees
        cur.execute("SELECT COUNT(*) FROM EMPLOYEE")
        total_employees = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM DOCTOR")
        total_doctors = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM NURSE")
        total_nurses = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM PHARMACIST")
        total_pharmacists = cur.fetchone()[0]
        
        # Total Rooms & Available Rooms
        cur.execute("SELECT COUNT(*) FROM ROOMS")
        total_rooms = cur.fetchone()[0]
        
        cur.execute("""
            SELECT COUNT(r.Room_no) 
            FROM ROOMS r 
            JOIN ROOMS_B rb ON r.Capacity = rb.Capacity 
            WHERE rb.Availability = 'Available'
        """)
        available_rooms = cur.fetchone()[0]
        
        # Total Revenue & Insurance from BILLS
        cur.execute("SELECT NVL(SUM(Amount), 0), NVL(SUM(I_amount), 0) FROM BILLS")
        rev_row = cur.fetchone()
        total_revenue = float(rev_row[0]) if rev_row else 0.0
        total_insurance = float(rev_row[1]) if rev_row else 0.0

        # Total Appointments
        cur.execute("SELECT COUNT(*) FROM APPOINTMENT")
        total_appointments = cur.fetchone()[0]

        return {
            "total_patients": total_patients,
            "active_patients": active_patients,
            "discharged_patients": total_patients - active_patients,
            "total_employees": total_employees,
            "total_doctors": total_doctors,
            "total_nurses": total_nurses,
            "total_pharmacists": total_pharmacists,
            "total_rooms": total_rooms,
            "available_rooms": available_rooms,
            "total_revenue": total_revenue,
            "total_insurance": total_insurance,
            "total_appointments": total_appointments
        }
    finally:
        conn.close()


def get_all_patients():
    """
    Returns full patient list joined across normalized hierarchy:
    PATIENT -> PATIENT_B (Phone) -> PATIENT_C (Address, Room) -> ROOMS -> Doctors -> Bills
    """
    sql = """
    SELECT 
        p.Patient_id,
        p.F_name,
        p.L_name,
        p.Gender,
        p.Phone,
        p.In_date,
        p.Out_date,
        CASE WHEN p.Out_date IS NULL THEN 'Admitted' ELSE 'Discharged' END AS Status,
        pb.Address,
        pc.Room_no,
        r.Type AS Room_type,
        r.Capacity AS Room_capacity,
        d_emp.F_name || ' ' || d_emp.L_name AS Doctor_name,
        doc.Specialization AS Doctor_specialization,
        v.Valid AS Insurance_valid,
        b.Amount AS Bill_amount,
        b.I_amount AS Insurance_amount
    FROM PATIENT p
    LEFT JOIN PATIENT_B pb ON p.Phone = pb.Phone
    LEFT JOIN PATIENT_C pc ON pb.Address = pc.Address
    LEFT JOIN ROOMS r ON pc.Room_no = r.Room_no
    LEFT JOIN Appointment_B ab ON p.Patient_id = ab.P_id
    LEFT JOIN DOCTOR doc ON ab.D_id = doc.Emp_id
    LEFT JOIN EMPLOYEE d_emp ON doc.Emp_id = d_emp.Emp_id
    LEFT JOIN VALID v ON p.Patient_id = v.P_id
    LEFT JOIN BILLS b ON p.Patient_id = b.P_id
    ORDER BY p.Patient_id ASC
    """
    return execute_query(sql)


def get_all_doctors():
    """
    Returns doctor roster with employee details, specialization, and supervisor name.
    """
    sql = """
    SELECT 
        d.Emp_id,
        e.F_name,
        e.L_name,
        e.Contact_no,
        e.Address,
        e.Age,
        d.Specialization,
        d.Designation,
        d.Supervisor_id,
        sup_e.F_name || ' ' || sup_e.L_name AS Supervisor_name,
        (SELECT COUNT(*) FROM Appointment_B ab WHERE ab.D_id = d.Emp_id) AS Patient_count
    FROM DOCTOR d
    JOIN EMPLOYEE e ON d.Emp_id = e.Emp_id
    LEFT JOIN DOCTOR sup_d ON d.Supervisor_id = sup_d.Emp_id
    LEFT JOIN EMPLOYEE sup_e ON sup_d.Emp_id = sup_e.Emp_id
    ORDER BY d.Emp_id ASC
    """
    return execute_query(sql)


def get_all_nurses():
    """
    Returns nurse roster with shift types and assigned rooms.
    """
    sql = """
    SELECT 
        n.Emp_id,
        e.F_name,
        e.L_name,
        e.Contact_no,
        e.Address,
        e.Age,
        n.Shift_type
    FROM NURSE n
    JOIN EMPLOYEE e ON n.Emp_id = e.Emp_id
    ORDER BY n.Emp_id ASC
    """
    nurses = execute_query(sql)
    
    # Attach assigned room numbers to each nurse
    conn = get_connection()
    try:
        cur = conn.cursor()
        for nurse in nurses:
            cur.execute("""
                SELECT nhr.Room_no, r.Type 
                FROM NURSE_HANDLES_ROOMS nhr
                JOIN ROOMS r ON nhr.Room_no = r.Room_no
                WHERE nhr.Emp_id = :1
                ORDER BY nhr.Room_no
            """, (nurse['emp_id'],))
            rooms = cur.fetchall()
            nurse['rooms_handled'] = [f"Room {r[0]} ({r[1]})" for r in rooms]
    finally:
        conn.close()
        
    return nurses


def get_all_pharmacists():
    """
    Returns pharmacist team with clearance levels and medical records processed.
    """
    sql = """
    SELECT 
        p.Emp_id,
        e.F_name,
        e.L_name,
        e.Contact_no,
        e.Address,
        e.Age,
        p.Clearance_level,
        (SELECT COUNT(*) FROM RECORD_HANDLER rh WHERE rh.Emp_id = p.Emp_id) AS Records_handled_count
    FROM PHARMACIST p
    JOIN EMPLOYEE e ON p.Emp_id = e.Emp_id
    ORDER BY p.Emp_id ASC
    """
    return execute_query(sql)


def get_all_rooms():
    """
    Returns rooms list with capacity, availability, type, and current occupant patient names.
    """
    sql = """
    SELECT 
        r.Room_no,
        r.Capacity,
        r.Type,
        rb.Availability,
        (
            SELECT LISTAGG(p.F_name || ' ' || p.L_name, ', ') WITHIN GROUP (ORDER BY p.Patient_id)
            FROM PATIENT p
            JOIN PATIENT_B pb ON p.Phone = pb.Phone
            JOIN PATIENT_C pc ON pb.Address = pc.Address
            WHERE pc.Room_no = r.Room_no AND p.Out_date IS NULL
        ) AS Current_occupants
    FROM ROOMS r
    JOIN ROOMS_B rb ON r.Capacity = rb.Capacity
    ORDER BY r.Room_no ASC
    """
    return execute_query(sql)


def get_all_billing():
    """
    Returns billing and insurance records linked to patient and valid tables.
    """
    sql = """
    SELECT 
        b.B_id,
        b.P_id,
        p.F_name || ' ' || p.L_name AS Patient_name,
        b.Amount,
        b.I_amount,
        (b.Amount - b.I_amount) AS Out_of_pocket,
        v.Valid AS Insurance_status
    FROM BILLS b
    JOIN PATIENT p ON b.P_id = p.Patient_id
    JOIN VALID v ON b.P_id = v.P_id
    ORDER BY b.B_id ASC
    """
    return execute_query(sql)


def get_all_appointments():
    """
    Returns appointment schedule linked with patient and doctor.
    """
    sql = """
    SELECT 
        a.Id,
        a.App_date,
        a.P_id,
        p.F_name || ' ' || p.L_name AS Patient_name,
        d_emp.F_name || ' ' || d_emp.L_name AS Doctor_name,
        doc.Specialization AS Doctor_specialization
    FROM APPOINTMENT a
    JOIN PATIENT p ON a.P_id = p.Patient_id
    LEFT JOIN Appointment_B ab ON p.Patient_id = ab.P_id
    LEFT JOIN DOCTOR doc ON ab.D_id = doc.Emp_id
    LEFT JOIN EMPLOYEE d_emp ON doc.Emp_id = d_emp.Emp_id
    ORDER BY a.App_date ASC
    """
    return execute_query(sql)


def get_all_test_reports():
    """
    Returns diagnostic test reports for patients.
    """
    sql = """
    SELECT 
        tr.R_id,
        tr.Patient_id,
        p.F_name || ' ' || p.L_name AS Patient_name,
        tr.Test_type,
        tr.Result
    FROM TEST_REPORT tr
    JOIN PATIENT p ON tr.Patient_id = p.Patient_id
    ORDER BY tr.R_id ASC
    """
    return execute_query(sql)


# =========================================================================
# The EER Showcase Queries & Complete Database Schema
# =========================================================================

FULL_DDL_SQL = """-- ==============================================================================
-- 1. BASE INDEPENDENT TABLES & NORMALIZED ROOM CHAIN
-- ==============================================================================

CREATE TABLE ROOMS_B (
    Capacity INT PRIMARY KEY,
    Availability VARCHAR2(50)
);

CREATE TABLE ROOMS (
    Room_no INT PRIMARY KEY,
    Capacity INT,
    Type VARCHAR2(50),
    CONSTRAINT fk_rooms_capacity FOREIGN KEY (Capacity) REFERENCES ROOMS_B(Capacity)
);

CREATE TABLE EMPLOYEE (
    Emp_id INT PRIMARY KEY,
    F_name VARCHAR2(50),
    L_name VARCHAR2(50),
    Address VARCHAR2(255),
    Contact_no VARCHAR2(15),
    Age INT
);

-- ==============================================================================
-- 2. NORMALIZED PATIENT CHAIN (Satisfies the "Assigned" Relationship to Rooms)
-- ==============================================================================

CREATE TABLE PATIENT_C (
    Address VARCHAR2(255) PRIMARY KEY,
    Room_no INT,
    CONSTRAINT fk_patientc_room FOREIGN KEY (Room_no) REFERENCES ROOMS(Room_no)
);

CREATE TABLE PATIENT_B (
    Phone VARCHAR2(15) PRIMARY KEY,
    Address VARCHAR2(255),
    CONSTRAINT fk_patientb_address FOREIGN KEY (Address) REFERENCES PATIENT_C(Address)
);

CREATE TABLE PATIENT (
    Patient_id INT PRIMARY KEY,
    F_name VARCHAR2(50),
    L_name VARCHAR2(50),
    Gender VARCHAR2(10),
    Phone VARCHAR2(15),
    In_date DATE,
    Out_date DATE,
    CONSTRAINT fk_patient_phone FOREIGN KEY (Phone) REFERENCES PATIENT_B(Phone)
);

-- ==============================================================================
-- 3. EMPLOYEE SUBCLASSES (Satisfying EER Inheritance constraints)
-- ==============================================================================

CREATE TABLE DOCTOR (
    Emp_id INT PRIMARY KEY,
    Specialization VARCHAR2(100),
    Designation VARCHAR2(100),
    Supervisor_id INT,
    CONSTRAINT fk_doctor_emp FOREIGN KEY (Emp_id) REFERENCES EMPLOYEE(Emp_id),
    CONSTRAINT fk_doctor_supervisor FOREIGN KEY (Supervisor_id) REFERENCES DOCTOR(Emp_id)
);

CREATE TABLE NURSE (
    Emp_id INT PRIMARY KEY,
    Shift_type VARCHAR2(50),
    CONSTRAINT fk_nurse_emp FOREIGN KEY (Emp_id) REFERENCES EMPLOYEE(Emp_id)
);

CREATE TABLE PHARMACIST (
    Emp_id INT PRIMARY KEY,
    Clearance_level VARCHAR2(50),
    CONSTRAINT fk_pharmacist_emp FOREIGN KEY (Emp_id) REFERENCES EMPLOYEE(Emp_id)
);

-- ==============================================================================
-- 4. WEAK ENTITIES (Satisfying EER Identifying Relationships to Patient)
-- ==============================================================================

CREATE TABLE PERSONS (
    Patient_id INT,
    Name VARCHAR2(100),
    Sex VARCHAR2(10),
    Age INT,
    Relationship VARCHAR2(50),
    PRIMARY KEY (Patient_id, Name),
    CONSTRAINT fk_persons_patient FOREIGN KEY (Patient_id) REFERENCES PATIENT(Patient_id)
);

CREATE TABLE TEST_REPORT (
    R_id INT,
    Patient_id INT,
    Test_type VARCHAR2(100),
    Result VARCHAR2(255),
    PRIMARY KEY (R_id, Patient_id),
    CONSTRAINT fk_test_patient FOREIGN KEY (Patient_id) REFERENCES PATIENT(Patient_id)
);

CREATE TABLE VALID (
    P_id INT PRIMARY KEY,
    Valid VARCHAR2(50),
    CONSTRAINT fk_valid_patient FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id)
);

CREATE TABLE BILLS (
    B_id INT,
    P_id INT,
    Amount NUMBER(10, 2),
    I_amount NUMBER(10, 2),
    PRIMARY KEY (B_id, P_id),
    CONSTRAINT fk_bills_valid FOREIGN KEY (P_id) REFERENCES VALID(P_id)
);

-- ==============================================================================
-- 5. ASSOCIATIONS & M:N RELATIONSHIPS (Satisfying EER Diagram links)
-- ==============================================================================

CREATE TABLE MEDICAL_RECORDS (
    R_id INT,
    P_id INT,
    Purchase_date DATE,
    PRIMARY KEY (R_id, P_id),
    CONSTRAINT fk_medrec_patient FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id)
);

CREATE TABLE RECORD_HANDLER (
    P_id INT,
    Purchase_date DATE,
    Emp_id INT,
    PRIMARY KEY (P_id, Purchase_date, Emp_id),
    CONSTRAINT fk_rechandler_patient FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id),
    CONSTRAINT fk_rechandler_pharmacist FOREIGN KEY (Emp_id) REFERENCES PHARMACIST(Emp_id)
);

CREATE TABLE APPOINTMENT (
    Id INT PRIMARY KEY,
    App_date DATE,
    P_id INT,
    CONSTRAINT fk_appointment_patient FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id)
);

CREATE TABLE Appointment_B (
    P_id INT,
    D_id INT,
    PRIMARY KEY (P_id, D_id),
    CONSTRAINT fk_appB_patient FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id),
    CONSTRAINT fk_appB_doctor FOREIGN KEY (D_id) REFERENCES DOCTOR(Emp_id)
);

CREATE TABLE NURSE_HANDLES_ROOMS (
    Emp_id INT,
    Room_no INT,
    PRIMARY KEY (Emp_id, Room_no),
    CONSTRAINT fk_nhr_nurse FOREIGN KEY (Emp_id) REFERENCES NURSE(Emp_id),
    CONSTRAINT fk_nhr_room FOREIGN KEY (Room_no) REFERENCES ROOMS(Room_no)
);"""

FULL_SEED_SQL = """-- ==============================================================================
-- SEED DATA INSERTIONS (All 18 Tables)
-- ==============================================================================

-- 1. ROOMS_B & ROOMS
INSERT INTO ROOMS_B (Capacity, Availability) VALUES (1, 'Available');
INSERT INTO ROOMS_B (Capacity, Availability) VALUES (2, 'Available');
INSERT INTO ROOMS_B (Capacity, Availability) VALUES (3, 'Full');
INSERT INTO ROOMS_B (Capacity, Availability) VALUES (4, 'Available');
INSERT INTO ROOMS_B (Capacity, Availability) VALUES (5, 'Maintenance');

INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES (101, 1, 'ICU');
INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES (102, 2, 'General');
INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES (103, 3, 'General');
INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES (104, 1, 'Private');
INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES (105, 4, 'Ward');
INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES (106, 2, 'Maternity');

-- 2. EMPLOYEE (Doctors 1-5, Nurses 6-10, Pharmacists 11-15)
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (1, 'Gregory', 'House', '101 Med St, NJ', '555-0101', 50);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (2, 'Derek', 'Shepherd', '202 Seattle Ave, WA', '555-0102', 45);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (3, 'Allison', 'Cameron', '303 Clinic Rd, NJ', '555-0103', 32);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (4, 'Stephen', 'Strange', '177A Bleecker St, NY', '555-0104', 42);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (5, 'Meredith', 'Grey', '404 Seattle Ave, WA', '555-0105', 38);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (6, 'Carla', 'Espinosa', '505 Sacred Heart, CA', '555-0106', 35);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (7, 'Jackie', 'Peyton', '606 All Saints, NY', '555-0107', 40);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (8, 'Rory', 'Williams', '707 Tardis Ln, UK', '555-0108', 28);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (9, 'Abby', 'Lockhart', '808 County Gen, IL', '555-0109', 39);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (10, 'Margaret', 'Houlihan', '909 Mash Camp, KR', '555-0110', 44);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (11, 'Ned', 'Flanders', '744 Evergreen Ter, SP', '555-0111', 45);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (12, 'Walter', 'White', '308 Negra Arroyo, NM', '555-0112', 50);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (13, 'Gus', 'Fring', '121 Los Pollos, NM', '555-0113', 48);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (14, 'Morty', 'Smith', '101 Sci-Fi Dr, WA', '555-0114', 25);
INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (15, 'Rick', 'Sanchez', '102 Sci-Fi Dr, WA', '555-0115', 65);

-- 3. PATIENT CHAIN (PATIENT_C, PATIENT_B, PATIENT)
INSERT INTO PATIENT_C (Address, Room_no) VALUES ('789 Pine St', 101);
INSERT INTO PATIENT_C (Address, Room_no) VALUES ('456 Oak St', 102);
INSERT INTO PATIENT_C (Address, Room_no) VALUES ('321 Maple Ave', 103);
INSERT INTO PATIENT_C (Address, Room_no) VALUES ('654 Birch Rd', 104);
INSERT INTO PATIENT_C (Address, Room_no) VALUES ('987 Cedar Ln', 105);
INSERT INTO PATIENT_C (Address, Room_no) VALUES ('111 Willow Dr', 106);

INSERT INTO PATIENT_B (Phone, Address) VALUES ('555-2001', '789 Pine St');
INSERT INTO PATIENT_B (Phone, Address) VALUES ('555-2002', '456 Oak St');
INSERT INTO PATIENT_B (Phone, Address) VALUES ('555-2003', '321 Maple Ave');
INSERT INTO PATIENT_B (Phone, Address) VALUES ('555-2004', '654 Birch Rd');
INSERT INTO PATIENT_B (Phone, Address) VALUES ('555-2005', '987 Cedar Ln');
INSERT INTO PATIENT_B (Phone, Address) VALUES ('555-2006', '111 Willow Dr');

INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES (1001, 'Bruce', 'Wayne', 'M', '555-2001', TO_DATE('2026-09-01', 'YYYY-MM-DD'), TO_DATE('2026-09-10', 'YYYY-MM-DD'));
INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES (1002, 'Clark', 'Kent', 'M', '555-2002', TO_DATE('2026-09-05', 'YYYY-MM-DD'), NULL);
INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES (1003, 'Diana', 'Prince', 'F', '555-2003', TO_DATE('2026-09-06', 'YYYY-MM-DD'), NULL);
INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES (1004, 'Barry', 'Allen', 'M', '555-2004', TO_DATE('2026-09-08', 'YYYY-MM-DD'), NULL);
INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES (1005, 'Arthur', 'Curry', 'M', '555-2005', TO_DATE('2026-09-10', 'YYYY-MM-DD'), TO_DATE('2026-09-12', 'YYYY-MM-DD'));
INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES (1006, 'Victor', 'Stone', 'M', '555-2006', TO_DATE('2026-09-11', 'YYYY-MM-DD'), NULL);

-- 4. EMPLOYEE SUBCLASSES
INSERT INTO DOCTOR (Emp_id, Specialization, Designation, Supervisor_id) VALUES (1, 'Diagnostics', 'Head of Dept', NULL);
INSERT INTO DOCTOR (Emp_id, Specialization, Designation, Supervisor_id) VALUES (2, 'Neurology', 'Senior Consultant', NULL);
INSERT INTO DOCTOR (Emp_id, Specialization, Designation, Supervisor_id) VALUES (3, 'Immunology', 'Resident', 1);
INSERT INTO DOCTOR (Emp_id, Specialization, Designation, Supervisor_id) VALUES (4, 'Neurosurgery', 'Attending', 2);
INSERT INTO DOCTOR (Emp_id, Specialization, Designation, Supervisor_id) VALUES (5, 'General Surgery', 'Resident', 1);

INSERT INTO NURSE (Emp_id, Shift_type) VALUES (6, 'Morning');
INSERT INTO NURSE (Emp_id, Shift_type) VALUES (7, 'Night');
INSERT INTO NURSE (Emp_id, Shift_type) VALUES (8, 'Morning');
INSERT INTO NURSE (Emp_id, Shift_type) VALUES (9, 'Night');
INSERT INTO NURSE (Emp_id, Shift_type) VALUES (10, 'Evening');

INSERT INTO PHARMACIST (Emp_id, Clearance_level) VALUES (11, 'Level 1');
INSERT INTO PHARMACIST (Emp_id, Clearance_level) VALUES (12, 'Level 2');
INSERT INTO PHARMACIST (Emp_id, Clearance_level) VALUES (13, 'Level 1');
INSERT INTO PHARMACIST (Emp_id, Clearance_level) VALUES (14, 'Level 3');
INSERT INTO PHARMACIST (Emp_id, Clearance_level) VALUES (15, 'Level 2');

-- 5. WEAK ENTITIES & BILLING
INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES (1001, 'Damian Wayne', 'M', 14, 'Son');
INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES (1001, 'Dick Grayson', 'M', 25, 'Ward');
INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES (1002, 'Lois Lane', 'F', 32, 'Spouse');
INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES (1003, 'Hippolyta', 'F', 60, 'Mother');
INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES (1004, 'Iris West', 'F', 28, 'Spouse');
INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES (1005, 'Mera', 'F', 30, 'Spouse');

INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES (501, 1001, 'Blood Test', 'Elevated Toxins');
INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES (502, 1001, 'MRI', 'Minor Bruising');
INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES (503, 1002, 'X-Ray', 'Indestructible Tissue anomaly');
INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES (504, 1003, 'ECG', 'Normal');
INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES (505, 1004, 'Metabolic Panel', 'Hyper-accelerated metabolism');
INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES (506, 1005, 'Hydration Test', 'Optimal');

INSERT INTO VALID (P_id, Valid) VALUES (1001, 'Yes');
INSERT INTO VALID (P_id, Valid) VALUES (1002, 'Yes');
INSERT INTO VALID (P_id, Valid) VALUES (1003, 'No');
INSERT INTO VALID (P_id, Valid) VALUES (1004, 'Yes');
INSERT INTO VALID (P_id, Valid) VALUES (1005, 'Yes');
INSERT INTO VALID (P_id, Valid) VALUES (1006, 'Pending');

INSERT INTO BILLS (B_id, P_id, Amount, I_amount) VALUES (801, 1001, 15000.00, 10000.00);
INSERT INTO BILLS (B_id, P_id, Amount, I_amount) VALUES (802, 1002, 1500.00, 1500.00);
INSERT INTO BILLS (B_id, P_id, Amount, I_amount) VALUES (803, 1003, 2000.00, 0.00);
INSERT INTO BILLS (B_id, P_id, Amount, I_amount) VALUES (804, 1004, 3000.00, 2500.00);
INSERT INTO BILLS (B_id, P_id, Amount, I_amount) VALUES (805, 1005, 750.00, 750.00);

-- 6. ASSOCIATIONS & M:N RELATIONSHIPS
INSERT INTO MEDICAL_RECORDS (R_id, P_id, Purchase_date) VALUES (901, 1001, TO_DATE('2026-09-02', 'YYYY-MM-DD'));
INSERT INTO MEDICAL_RECORDS (R_id, P_id, Purchase_date) VALUES (902, 1002, TO_DATE('2026-09-06', 'YYYY-MM-DD'));
INSERT INTO MEDICAL_RECORDS (R_id, P_id, Purchase_date) VALUES (903, 1003, TO_DATE('2026-09-07', 'YYYY-MM-DD'));
INSERT INTO MEDICAL_RECORDS (R_id, P_id, Purchase_date) VALUES (904, 1004, TO_DATE('2026-09-08', 'YYYY-MM-DD'));
INSERT INTO MEDICAL_RECORDS (R_id, P_id, Purchase_date) VALUES (905, 1005, TO_DATE('2026-09-10', 'YYYY-MM-DD'));

INSERT INTO RECORD_HANDLER (P_id, Purchase_date, Emp_id) VALUES (1001, TO_DATE('2026-09-02', 'YYYY-MM-DD'), 11);
INSERT INTO RECORD_HANDLER (P_id, Purchase_date, Emp_id) VALUES (1002, TO_DATE('2026-09-06', 'YYYY-MM-DD'), 12);
INSERT INTO RECORD_HANDLER (P_id, Purchase_date, Emp_id) VALUES (1003, TO_DATE('2026-09-07', 'YYYY-MM-DD'), 13);
INSERT INTO RECORD_HANDLER (P_id, Purchase_date, Emp_id) VALUES (1004, TO_DATE('2026-09-08', 'YYYY-MM-DD'), 11);
INSERT INTO RECORD_HANDLER (P_id, Purchase_date, Emp_id) VALUES (1005, TO_DATE('2026-09-10', 'YYYY-MM-DD'), 14);

INSERT INTO APPOINTMENT (Id, App_date, P_id) VALUES (2001, TO_DATE('2026-09-01', 'YYYY-MM-DD'), 1001);
INSERT INTO APPOINTMENT (Id, App_date, P_id) VALUES (2002, TO_DATE('2026-09-05', 'YYYY-MM-DD'), 1002);
INSERT INTO APPOINTMENT (Id, App_date, P_id) VALUES (2003, TO_DATE('2026-09-06', 'YYYY-MM-DD'), 1003);
INSERT INTO APPOINTMENT (Id, App_date, P_id) VALUES (2004, TO_DATE('2026-09-08', 'YYYY-MM-DD'), 1004);
INSERT INTO APPOINTMENT (Id, App_date, P_id) VALUES (2005, TO_DATE('2026-09-15', 'YYYY-MM-DD'), 1006);

INSERT INTO Appointment_B (P_id, D_id) VALUES (1001, 1);
INSERT INTO Appointment_B (P_id, D_id) VALUES (1002, 2);
INSERT INTO Appointment_B (P_id, D_id) VALUES (1003, 4);
INSERT INTO Appointment_B (P_id, D_id) VALUES (1004, 1);
INSERT INTO Appointment_B (P_id, D_id) VALUES (1005, 3);
INSERT INTO Appointment_B (P_id, D_id) VALUES (1006, 5);

INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (6, 101);
INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (6, 102);
INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (7, 103);
INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (8, 104);
INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (9, 105);
INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (10, 106);
INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (8, 101);

COMMIT;"""

DEMO_QUERIES = [
    {
        "id": "schema_master",
        "category": "master",
        "title": "📜 Master Database Script (Full DDL + Inserts + 5 Queries)",
        "description": "Complete, production-ready Oracle SQL script containing all 18 table definitions, constraints, sample seed data insertions, and EER demonstration queries.",
        "sql": "" # Loaded from schema.sql dynamically or FULL_DDL_SQL + FULL_SEED_SQL
    },
    {
        "id": "schema_ddl",
        "category": "ddl",
        "title": "🏗️ Full Schema DDL (All 18 CREATE TABLE Statements)",
        "description": "Complete Data Definition Language (DDL) statements defining the normalized EER hierarchy, Primary Keys, and Foreign Key constraints across all 18 hospital tables.",
        "sql": FULL_DDL_SQL
    },
    {
        "id": "schema_inserts",
        "category": "seed",
        "title": "📥 Full Seed Data Insertions (All 18 Tables)",
        "description": "Complete INSERT INTO statements populating Doctors, Nurses, Pharmacists, Patients, Rooms, Appointments, Tests, Records, and Billing into Oracle DB.",
        "sql": FULL_SEED_SQL
    },
    {
        "id": "query_1",
        "category": "demo",
        "title": "1. Basic Filtering (WHERE clause)",
        "description": "Retrieves the room numbers and capacities of all rooms that are specifically designated as 'General' wards.",
        "sql": "SELECT Room_no, Capacity FROM ROOMS WHERE Type = 'General'"
    },
    {
        "id": "query_2",
        "category": "demo",
        "title": "2. Finding Missing Data (IS NULL)",
        "description": "Identifies all patients who are currently admitted to the hospital (meaning their discharge date has not yet been recorded).",
        "sql": "SELECT Patient_id, F_name, L_name, In_date FROM PATIENT WHERE Out_date IS NULL"
    },
    {
        "id": "query_3",
        "category": "demo",
        "title": "3. Simple Aggregation (GROUP BY)",
        "description": "Counts the number of nurses assigned to each type of shift (e.g., Morning, Night, Evening).",
        "sql": "SELECT Shift_type, COUNT(Emp_id) AS Total_Nurses FROM NURSE GROUP BY Shift_type"
    },
    {
        "id": "query_4",
        "category": "demo",
        "title": "4. Sorting Data (ORDER BY)",
        "description": "Retrieves a list of all employees over the age of 40, sorted from oldest to youngest.",
        "sql": "SELECT Emp_id, F_name, L_name, Age FROM EMPLOYEE WHERE Age > 40 ORDER BY Age DESC"
    },
    {
        "id": "query_5",
        "category": "demo",
        "title": "5. Simple 2-Table JOIN",
        "description": "Fetches the names and clearance levels of all pharmacists by linking the base EMPLOYEE table with the PHARMACIST subclass table.",
        "sql": "SELECT e.F_name, e.L_name, p.Clearance_level FROM EMPLOYEE e JOIN PHARMACIST p ON e.Emp_id = p.Emp_id"
    }
]

def get_master_sql():
    """Reads or generates the full master schema.sql script."""
    try:
        with open(os.path.join(os.path.dirname(__file__), "schema.sql"), "r", encoding="utf-8") as f:
            return f.read()
    except Exception:
        return FULL_DDL_SQL + "\n\n" + FULL_SEED_SQL

# Populate master script
DEMO_QUERIES[0]["sql"] = get_master_sql()


def run_demo_query(query_id):
    """Executes or presents one of the showcase queries or schema verification."""
    query_obj = next((q for q in DEMO_QUERIES if q["id"] == query_id), None)
    if not query_obj:
        raise ValueError(f"Query '{query_id}' not found.")

    if query_obj["category"] in ("master", "ddl", "seed"):
        # For DDL/Seed showcase, run a live schema verification query to return live table list & row counts
        sql_verify = """
        SELECT 
            table_name AS "TABLE_NAME",
            (SELECT COUNT(*) FROM user_tab_cols WHERE table_name = t.table_name) AS "COLUMNS_COUNT",
            (SELECT COUNT(*) FROM user_constraints WHERE table_name = t.table_name AND constraint_type = 'R') AS "FOREIGN_KEYS"
        FROM user_tables t
        ORDER BY table_name ASC
        """
        result = execute_custom_query(sql_verify)
        return {
            "id": query_obj["id"],
            "title": query_obj["title"],
            "description": query_obj["description"],
            "sql": query_obj["sql"],
            "columns": result["columns"],
            "rows": result["rows"],
            "row_count": result["row_count"],
            "duration_ms": result["duration_ms"]
        }

    result = execute_custom_query(query_obj["sql"])
    return {
        "id": query_obj["id"],
        "title": query_obj["title"],
        "description": query_obj["description"],
        "sql": query_obj["sql"],
        "columns": result["columns"],
        "rows": result["rows"],
        "row_count": result["row_count"],
        "duration_ms": result["duration_ms"]
    }


def add_patient(patient_data):
    """
    Inserts a new patient record into the normalized Oracle database schema:
    1. PATIENT_C (Address, Room_no)
    2. PATIENT_B (Phone, Address)
    3. PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date)
    4. VALID (P_id, Valid)
    5. Appointment_B & APPOINTMENT (P_id, D_id) [if doctor selected]
    6. BILLS (B_id, P_id, Amount, I_amount) [if bill amount entered]
    """
    conn = get_connection()
    try:
        cur = conn.cursor()
        
        # 1. Generate next Patient_id
        cur.execute("SELECT NVL(MAX(Patient_id), 1000) + 1 FROM PATIENT")
        patient_id = int(cur.fetchone()[0])
        
        f_name = patient_data.get("f_name", "").strip()
        l_name = patient_data.get("l_name", "").strip()
        gender = patient_data.get("gender", "M").strip()
        phone = patient_data.get("phone", "").strip()
        address = patient_data.get("address", "").strip()
        
        room_no = int(patient_data["room_no"]) if patient_data.get("room_no") else None
        doctor_id = int(patient_data["doctor_id"]) if patient_data.get("doctor_id") else None
        
        in_date_str = patient_data.get("in_date") or datetime.now().strftime("%Y-%m-%d")
        out_date_str = patient_data.get("out_date") if patient_data.get("out_date") else None
        
        insurance_valid = patient_data.get("insurance_valid", "Yes").strip()
        bill_amount = float(patient_data["bill_amount"]) if patient_data.get("bill_amount") else None
        i_amount = float(patient_data.get("i_amount", 0.0)) if patient_data.get("i_amount") else 0.0

        if not f_name or not l_name:
            raise ValueError("First Name and Last Name are required.")
        if not phone:
            raise ValueError("Phone number is required.")
        if not address:
            raise ValueError("Address is required.")

        # 2. Insert into PATIENT_C
        cur.execute("SELECT COUNT(*) FROM PATIENT_C WHERE Address = :1", (address,))
        if cur.fetchone()[0] == 0:
            cur.execute("INSERT INTO PATIENT_C (Address, Room_no) VALUES (:1, :2)", (address, room_no))
        else:
            if room_no is not None:
                cur.execute("UPDATE PATIENT_C SET Room_no = :1 WHERE Address = :2", (room_no, address))
                
        # 3. Insert into PATIENT_B
        cur.execute("SELECT COUNT(*) FROM PATIENT_B WHERE Phone = :1", (phone,))
        if cur.fetchone()[0] == 0:
            cur.execute("INSERT INTO PATIENT_B (Phone, Address) VALUES (:1, :2)", (phone, address))
        else:
            cur.execute("UPDATE PATIENT_B SET Address = :1 WHERE Phone = :2", (address, phone))
            
        # 4. Insert into PATIENT
        if out_date_str:
            cur.execute("""
                INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date)
                VALUES (:1, :2, :3, :4, :5, TO_DATE(:6, 'YYYY-MM-DD'), TO_DATE(:7, 'YYYY-MM-DD'))
            """, (patient_id, f_name, l_name, gender, phone, in_date_str, out_date_str))
        else:
            cur.execute("""
                INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date)
                VALUES (:1, :2, :3, :4, :5, TO_DATE(:6, 'YYYY-MM-DD'), NULL)
            """, (patient_id, f_name, l_name, gender, phone, in_date_str))
            
        # 5. Insert into VALID
        cur.execute("INSERT INTO VALID (P_id, Valid) VALUES (:1, :2)", (patient_id, insurance_valid))
        
        # 6. Insert into Appointment_B (if doctor selected)
        if doctor_id:
            cur.execute("INSERT INTO Appointment_B (P_id, D_id) VALUES (:1, :2)", (patient_id, doctor_id))
            
            # Also create an entry in APPOINTMENT
            cur.execute("SELECT NVL(MAX(Id), 2000) + 1 FROM APPOINTMENT")
            appt_id = int(cur.fetchone()[0])
            cur.execute("""
                INSERT INTO APPOINTMENT (Id, App_date, P_id)
                VALUES (:1, TO_DATE(:2, 'YYYY-MM-DD'), :3)
            """, (appt_id, in_date_str, patient_id))

        # 7. Insert into BILLS (if bill amount provided)
        if bill_amount is not None and bill_amount > 0:
            cur.execute("SELECT NVL(MAX(B_id), 800) + 1 FROM BILLS")
            bill_id = int(cur.fetchone()[0])
            cur.execute("""
                INSERT INTO BILLS (B_id, P_id, Amount, I_amount)
                VALUES (:1, :2, :3, :4)
            """, (bill_id, patient_id, bill_amount, i_amount))
            
        conn.commit()
        return {
            "success": True,
            "patient_id": patient_id,
            "message": f"Patient {f_name} {l_name} (ID: #{patient_id}) added to Oracle database successfully!"
        }
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

