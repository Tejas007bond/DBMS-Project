"""
Database Initialization Script for Hospital Management System
Creates/recreates tables and seeds full normalized dataset into Oracle SQL.
"""

import db
import oracledb

DDL_STATEMENTS = [
    # 1. Base Independent Tables & Room Chain
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE NURSE_HANDLES_ROOMS CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE Appointment_B CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE APPOINTMENT CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE RECORD_HANDLER CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE MEDICAL_RECORDS CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE BILLS CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE VALID CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE TEST_REPORT CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE PERSONS CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE PHARMACIST CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE NURSE CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE DOCTOR CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE PATIENT CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE PATIENT_B CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE PATIENT_C CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE EMPLOYEE CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE ROOMS CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,
    """
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE ROOMS_B CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    """,

    # Create Tables
    """
    CREATE TABLE ROOMS_B (
        Capacity INT PRIMARY KEY,
        Availability VARCHAR2(50)
    )
    """,
    """
    CREATE TABLE ROOMS (
        Room_no INT PRIMARY KEY,
        Capacity INT,
        Type VARCHAR2(50),
        CONSTRAINT fk_rooms_capacity FOREIGN KEY (Capacity) REFERENCES ROOMS_B(Capacity)
    )
    """,
    """
    CREATE TABLE EMPLOYEE (
        Emp_id INT PRIMARY KEY,
        F_name VARCHAR2(50),
        L_name VARCHAR2(50),
        Address VARCHAR2(255),
        Contact_no VARCHAR2(15),
        Age INT
    )
    """,
    """
    CREATE TABLE PATIENT_C (
        Address VARCHAR2(255) PRIMARY KEY,
        Room_no INT,
        CONSTRAINT fk_patientc_room FOREIGN KEY (Room_no) REFERENCES ROOMS(Room_no)
    )
    """,
    """
    CREATE TABLE PATIENT_B (
        Phone VARCHAR2(15) PRIMARY KEY,
        Address VARCHAR2(255),
        CONSTRAINT fk_patientb_address FOREIGN KEY (Address) REFERENCES PATIENT_C(Address)
    )
    """,
    """
    CREATE TABLE PATIENT (
        Patient_id INT PRIMARY KEY,
        F_name VARCHAR2(50),
        L_name VARCHAR2(50),
        Gender VARCHAR2(10),
        Phone VARCHAR2(15),
        In_date DATE,
        Out_date DATE,
        CONSTRAINT fk_patient_phone FOREIGN KEY (Phone) REFERENCES PATIENT_B(Phone)
    )
    """,
    """
    CREATE TABLE DOCTOR (
        Emp_id INT PRIMARY KEY,
        Specialization VARCHAR2(100),
        Designation VARCHAR2(100),
        Supervisor_id INT,
        CONSTRAINT fk_doctor_emp FOREIGN KEY (Emp_id) REFERENCES EMPLOYEE(Emp_id),
        CONSTRAINT fk_doctor_supervisor FOREIGN KEY (Supervisor_id) REFERENCES DOCTOR(Emp_id)
    )
    """,
    """
    CREATE TABLE NURSE (
        Emp_id INT PRIMARY KEY,
        Shift_type VARCHAR2(50),
        CONSTRAINT fk_nurse_emp FOREIGN KEY (Emp_id) REFERENCES EMPLOYEE(Emp_id)
    )
    """,
    """
    CREATE TABLE PHARMACIST (
        Emp_id INT PRIMARY KEY,
        Clearance_level VARCHAR2(50),
        CONSTRAINT fk_pharmacist_emp FOREIGN KEY (Emp_id) REFERENCES EMPLOYEE(Emp_id)
    )
    """,
    """
    CREATE TABLE PERSONS (
        Patient_id INT,
        Name VARCHAR2(100),
        Sex VARCHAR2(10),
        Age INT,
        Relationship VARCHAR2(50),
        PRIMARY KEY (Patient_id, Name),
        CONSTRAINT fk_persons_patient FOREIGN KEY (Patient_id) REFERENCES PATIENT(Patient_id)
    )
    """,
    """
    CREATE TABLE TEST_REPORT (
        R_id INT,
        Patient_id INT,
        Test_type VARCHAR2(100),
        Result VARCHAR2(255),
        PRIMARY KEY (R_id, Patient_id),
        CONSTRAINT fk_test_patient FOREIGN KEY (Patient_id) REFERENCES PATIENT(Patient_id)
    )
    """,
    """
    CREATE TABLE VALID (
        P_id INT PRIMARY KEY,
        Valid VARCHAR2(50),
        CONSTRAINT fk_valid_patient FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id)
    )
    """,
    """
    CREATE TABLE BILLS (
        B_id INT,
        P_id INT,
        Amount NUMBER(10, 2),
        I_amount NUMBER(10, 2),
        PRIMARY KEY (B_id, P_id),
        CONSTRAINT fk_bills_valid FOREIGN KEY (P_id) REFERENCES VALID(P_id)
    )
    """,
    """
    CREATE TABLE MEDICAL_RECORDS (
        R_id INT,
        P_id INT,
        Purchase_date DATE,
        PRIMARY KEY (R_id, P_id),
        CONSTRAINT fk_medrec_patient FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id)
    )
    """,
    """
    CREATE TABLE RECORD_HANDLER (
        P_id INT,
        Purchase_date DATE,
        Emp_id INT,
        PRIMARY KEY (P_id, Purchase_date, Emp_id),
        CONSTRAINT fk_rechandler_patient FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id),
        CONSTRAINT fk_rechandler_pharmacist FOREIGN KEY (Emp_id) REFERENCES PHARMACIST(Emp_id)
    )
    """,
    """
    CREATE TABLE APPOINTMENT (
        Id INT PRIMARY KEY,
        App_date DATE,
        P_id INT,
        CONSTRAINT fk_appointment_patient FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id)
    )
    """,
    """
    CREATE TABLE Appointment_B (
        P_id INT,
        D_id INT,
        PRIMARY KEY (P_id, D_id),
        CONSTRAINT fk_appB_patient FOREIGN KEY (P_id) REFERENCES PATIENT(Patient_id),
        CONSTRAINT fk_appB_doctor FOREIGN KEY (D_id) REFERENCES DOCTOR(Emp_id)
    )
    """,
    """
    CREATE TABLE NURSE_HANDLES_ROOMS (
        Emp_id INT,
        Room_no INT,
        PRIMARY KEY (Emp_id, Room_no),
        CONSTRAINT fk_nhr_nurse FOREIGN KEY (Emp_id) REFERENCES NURSE(Emp_id),
        CONSTRAINT fk_nhr_room FOREIGN KEY (Room_no) REFERENCES ROOMS(Room_no)
    )
    """
]

SEED_DATA_STATEMENTS = [
    # ROOMS_B
    "INSERT INTO ROOMS_B (Capacity, Availability) VALUES (1, 'Available')",
    "INSERT INTO ROOMS_B (Capacity, Availability) VALUES (2, 'Available')",
    "INSERT INTO ROOMS_B (Capacity, Availability) VALUES (3, 'Full')",
    "INSERT INTO ROOMS_B (Capacity, Availability) VALUES (4, 'Available')",
    "INSERT INTO ROOMS_B (Capacity, Availability) VALUES (5, 'Maintenance')",

    # ROOMS
    "INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES (101, 1, 'ICU')",
    "INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES (102, 2, 'General')",
    "INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES (103, 3, 'General')",
    "INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES (104, 1, 'Private')",
    "INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES (105, 4, 'Ward')",
    "INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES (106, 2, 'Maternity')",

    # EMPLOYEE
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (1, 'Gregory', 'House', '101 Med St, NJ', '555-0101', 50)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (2, 'Derek', 'Shepherd', '202 Seattle Ave, WA', '555-0102', 45)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (3, 'Allison', 'Cameron', '303 Clinic Rd, NJ', '555-0103', 32)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (4, 'Stephen', 'Strange', '177A Bleecker St, NY', '555-0104', 42)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (5, 'Meredith', 'Grey', '404 Seattle Ave, WA', '555-0105', 38)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (6, 'Carla', 'Espinosa', '505 Sacred Heart, CA', '555-0106', 35)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (7, 'Jackie', 'Peyton', '606 All Saints, NY', '555-0107', 40)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (8, 'Rory', 'Williams', '707 Tardis Ln, UK', '555-0108', 28)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (9, 'Abby', 'Lockhart', '808 County Gen, IL', '555-0109', 39)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (10, 'Margaret', 'Houlihan', '909 Mash Camp, KR', '555-0110', 44)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (11, 'Ned', 'Flanders', '744 Evergreen Ter, SP', '555-0111', 45)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (12, 'Walter', 'White', '308 Negra Arroyo, NM', '555-0112', 50)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (13, 'Gus', 'Fring', '121 Los Pollos, NM', '555-0113', 48)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (14, 'Morty', 'Smith', '101 Sci-Fi Dr, WA', '555-0114', 25)",
    "INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Address, Contact_no, Age) VALUES (15, 'Rick', 'Sanchez', '102 Sci-Fi Dr, WA', '555-0115', 65)",

    # PATIENT_C
    "INSERT INTO PATIENT_C (Address, Room_no) VALUES ('789 Pine St', 101)",
    "INSERT INTO PATIENT_C (Address, Room_no) VALUES ('456 Oak St', 102)",
    "INSERT INTO PATIENT_C (Address, Room_no) VALUES ('321 Maple Ave', 103)",
    "INSERT INTO PATIENT_C (Address, Room_no) VALUES ('654 Birch Rd', 104)",
    "INSERT INTO PATIENT_C (Address, Room_no) VALUES ('987 Cedar Ln', 105)",
    "INSERT INTO PATIENT_C (Address, Room_no) VALUES ('111 Willow Dr', 106)",

    # PATIENT_B
    "INSERT INTO PATIENT_B (Phone, Address) VALUES ('555-2001', '789 Pine St')",
    "INSERT INTO PATIENT_B (Phone, Address) VALUES ('555-2002', '456 Oak St')",
    "INSERT INTO PATIENT_B (Phone, Address) VALUES ('555-2003', '321 Maple Ave')",
    "INSERT INTO PATIENT_B (Phone, Address) VALUES ('555-2004', '654 Birch Rd')",
    "INSERT INTO PATIENT_B (Phone, Address) VALUES ('555-2005', '987 Cedar Ln')",
    "INSERT INTO PATIENT_B (Phone, Address) VALUES ('555-2006', '111 Willow Dr')",

    # PATIENT
    "INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES (1001, 'Bruce', 'Wayne', 'M', '555-2001', TO_DATE('2026-09-01', 'YYYY-MM-DD'), TO_DATE('2026-09-10', 'YYYY-MM-DD'))",
    "INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES (1002, 'Clark', 'Kent', 'M', '555-2002', TO_DATE('2026-09-05', 'YYYY-MM-DD'), NULL)",
    "INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES (1003, 'Diana', 'Prince', 'F', '555-2003', TO_DATE('2026-09-06', 'YYYY-MM-DD'), NULL)",
    "INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES (1004, 'Barry', 'Allen', 'M', '555-2004', TO_DATE('2026-09-08', 'YYYY-MM-DD'), NULL)",
    "INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES (1005, 'Arthur', 'Curry', 'M', '555-2005', TO_DATE('2026-09-10', 'YYYY-MM-DD'), TO_DATE('2026-09-12', 'YYYY-MM-DD'))",
    "INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES (1006, 'Victor', 'Stone', 'M', '555-2006', TO_DATE('2026-09-11', 'YYYY-MM-DD'), NULL)",

    # DOCTOR
    "INSERT INTO DOCTOR (Emp_id, Specialization, Designation, Supervisor_id) VALUES (1, 'Diagnostics', 'Head of Dept', NULL)",
    "INSERT INTO DOCTOR (Emp_id, Specialization, Designation, Supervisor_id) VALUES (2, 'Neurology', 'Senior Consultant', NULL)",
    "INSERT INTO DOCTOR (Emp_id, Specialization, Designation, Supervisor_id) VALUES (3, 'Immunology', 'Resident', 1)",
    "INSERT INTO DOCTOR (Emp_id, Specialization, Designation, Supervisor_id) VALUES (4, 'Neurosurgery', 'Attending', 2)",
    "INSERT INTO DOCTOR (Emp_id, Specialization, Designation, Supervisor_id) VALUES (5, 'General Surgery', 'Resident', 1)",

    # NURSE
    "INSERT INTO NURSE (Emp_id, Shift_type) VALUES (6, 'Morning')",
    "INSERT INTO NURSE (Emp_id, Shift_type) VALUES (7, 'Night')",
    "INSERT INTO NURSE (Emp_id, Shift_type) VALUES (8, 'Morning')",
    "INSERT INTO NURSE (Emp_id, Shift_type) VALUES (9, 'Night')",
    "INSERT INTO NURSE (Emp_id, Shift_type) VALUES (10, 'Evening')",

    # PHARMACIST
    "INSERT INTO PHARMACIST (Emp_id, Clearance_level) VALUES (11, 'Level 1')",
    "INSERT INTO PHARMACIST (Emp_id, Clearance_level) VALUES (12, 'Level 2')",
    "INSERT INTO PHARMACIST (Emp_id, Clearance_level) VALUES (13, 'Level 1')",
    "INSERT INTO PHARMACIST (Emp_id, Clearance_level) VALUES (14, 'Level 3')",
    "INSERT INTO PHARMACIST (Emp_id, Clearance_level) VALUES (15, 'Level 2')",

    # PERSONS
    "INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES (1001, 'Damian Wayne', 'M', 14, 'Son')",
    "INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES (1001, 'Dick Grayson', 'M', 25, 'Ward')",
    "INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES (1002, 'Lois Lane', 'F', 32, 'Spouse')",
    "INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES (1003, 'Hippolyta', 'F', 60, 'Mother')",
    "INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES (1004, 'Iris West', 'F', 28, 'Spouse')",
    "INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES (1005, 'Mera', 'F', 30, 'Spouse')",

    # TEST_REPORT
    "INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES (501, 1001, 'Blood Test', 'Elevated Toxins')",
    "INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES (502, 1001, 'MRI', 'Minor Bruising')",
    "INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES (503, 1002, 'X-Ray', 'Indestructible Tissue anomaly')",
    "INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES (504, 1003, 'ECG', 'Normal')",
    "INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES (505, 1004, 'Metabolic Panel', 'Hyper-accelerated metabolism')",
    "INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES (506, 1005, 'Hydration Test', 'Optimal')",

    # VALID
    "INSERT INTO VALID (P_id, Valid) VALUES (1001, 'Yes')",
    "INSERT INTO VALID (P_id, Valid) VALUES (1002, 'Yes')",
    "INSERT INTO VALID (P_id, Valid) VALUES (1003, 'No')",
    "INSERT INTO VALID (P_id, Valid) VALUES (1004, 'Yes')",
    "INSERT INTO VALID (P_id, Valid) VALUES (1005, 'Yes')",
    "INSERT INTO VALID (P_id, Valid) VALUES (1006, 'Pending')",

    # BILLS
    "INSERT INTO BILLS (B_id, P_id, Amount, I_amount) VALUES (801, 1001, 15000.00, 10000.00)",
    "INSERT INTO BILLS (B_id, P_id, Amount, I_amount) VALUES (802, 1002, 1500.00, 1500.00)",
    "INSERT INTO BILLS (B_id, P_id, Amount, I_amount) VALUES (803, 1003, 2000.00, 0.00)",
    "INSERT INTO BILLS (B_id, P_id, Amount, I_amount) VALUES (804, 1004, 3000.00, 2500.00)",
    "INSERT INTO BILLS (B_id, P_id, Amount, I_amount) VALUES (805, 1005, 750.00, 750.00)",

    # MEDICAL_RECORDS
    "INSERT INTO MEDICAL_RECORDS (R_id, P_id, Purchase_date) VALUES (901, 1001, TO_DATE('2026-09-02', 'YYYY-MM-DD'))",
    "INSERT INTO MEDICAL_RECORDS (R_id, P_id, Purchase_date) VALUES (902, 1002, TO_DATE('2026-09-06', 'YYYY-MM-DD'))",
    "INSERT INTO MEDICAL_RECORDS (R_id, P_id, Purchase_date) VALUES (903, 1003, TO_DATE('2026-09-07', 'YYYY-MM-DD'))",
    "INSERT INTO MEDICAL_RECORDS (R_id, P_id, Purchase_date) VALUES (904, 1004, TO_DATE('2026-09-08', 'YYYY-MM-DD'))",
    "INSERT INTO MEDICAL_RECORDS (R_id, P_id, Purchase_date) VALUES (905, 1005, TO_DATE('2026-09-10', 'YYYY-MM-DD'))",

    # RECORD_HANDLER
    "INSERT INTO RECORD_HANDLER (P_id, Purchase_date, Emp_id) VALUES (1001, TO_DATE('2026-09-02', 'YYYY-MM-DD'), 11)",
    "INSERT INTO RECORD_HANDLER (P_id, Purchase_date, Emp_id) VALUES (1002, TO_DATE('2026-09-06', 'YYYY-MM-DD'), 12)",
    "INSERT INTO RECORD_HANDLER (P_id, Purchase_date, Emp_id) VALUES (1003, TO_DATE('2026-09-07', 'YYYY-MM-DD'), 13)",
    "INSERT INTO RECORD_HANDLER (P_id, Purchase_date, Emp_id) VALUES (1004, TO_DATE('2026-09-08', 'YYYY-MM-DD'), 11)",
    "INSERT INTO RECORD_HANDLER (P_id, Purchase_date, Emp_id) VALUES (1005, TO_DATE('2026-09-10', 'YYYY-MM-DD'), 14)",

    # APPOINTMENT
    "INSERT INTO APPOINTMENT (Id, App_date, P_id) VALUES (2001, TO_DATE('2026-09-01', 'YYYY-MM-DD'), 1001)",
    "INSERT INTO APPOINTMENT (Id, App_date, P_id) VALUES (2002, TO_DATE('2026-09-05', 'YYYY-MM-DD'), 1002)",
    "INSERT INTO APPOINTMENT (Id, App_date, P_id) VALUES (2003, TO_DATE('2026-09-06', 'YYYY-MM-DD'), 1003)",
    "INSERT INTO APPOINTMENT (Id, App_date, P_id) VALUES (2004, TO_DATE('2026-09-08', 'YYYY-MM-DD'), 1004)",
    "INSERT INTO APPOINTMENT (Id, App_date, P_id) VALUES (2005, TO_DATE('2026-09-15', 'YYYY-MM-DD'), 1006)",

    # Appointment_B
    "INSERT INTO Appointment_B (P_id, D_id) VALUES (1001, 1)",
    "INSERT INTO Appointment_B (P_id, D_id) VALUES (1002, 2)",
    "INSERT INTO Appointment_B (P_id, D_id) VALUES (1003, 4)",
    "INSERT INTO Appointment_B (P_id, D_id) VALUES (1004, 1)",
    "INSERT INTO Appointment_B (P_id, D_id) VALUES (1005, 3)",
    "INSERT INTO Appointment_B (P_id, D_id) VALUES (1006, 5)",

    # NURSE_HANDLES_ROOMS
    "INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (6, 101)",
    "INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (6, 102)",
    "INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (7, 103)",
    "INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (8, 104)",
    "INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (9, 105)",
    "INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (10, 106)",
    "INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (8, 101)"
]

def init_database():
    print("Connecting to Oracle Database...")
    conn = db.get_connection()
    cursor = conn.cursor()

    print("Executing DDL statements...")
    for idx, stmt in enumerate(DDL_STATEMENTS, 1):
        try:
            cursor.execute(stmt.strip())
        except Exception as e:
            print(f"Warning on DDL {idx}: {e}")

    print("Executing Seed Data inserts...")
    for idx, stmt in enumerate(SEED_DATA_STATEMENTS, 1):
        try:
            cursor.execute(stmt.strip())
        except Exception as e:
            print(f"Error on Seed {idx} ({stmt[:40]}...): {e}")

    conn.commit()
    print("Database initialized and committed successfully!")
    
    # Verify counts
    tables = [
        'ROOMS_B', 'ROOMS', 'EMPLOYEE', 'PATIENT_C', 'PATIENT_B', 
        'PATIENT', 'DOCTOR', 'NURSE', 'PHARMACIST', 'PERSONS', 
        'TEST_REPORT', 'VALID', 'BILLS', 'MEDICAL_RECORDS', 
        'RECORD_HANDLER', 'APPOINTMENT', 'APPOINTMENT_B', 'NURSE_HANDLES_ROOMS'
    ]
    print("\nTable Verification Summary:")
    for t in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {t}")
        cnt = cursor.fetchone()[0]
        print(f"  - {t}: {cnt} rows")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    init_database()
