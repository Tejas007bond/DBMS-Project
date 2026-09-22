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
# The 5 Core EER Demonstration Queries
# =========================================================================

DEMO_QUERIES = [
    {
        "id": "query_1",
        "title": "1. Basic Filtering (WHERE clause)",
        "description": "Retrieves the room numbers and capacities of all rooms that are specifically designated as 'General' wards.",
        "sql": "SELECT Room_no, Capacity FROM ROOMS WHERE Type = 'General'"
    },
    {
        "id": "query_2",
        "title": "2. Finding Missing Data (IS NULL)",
        "description": "Identifies all patients who are currently admitted to the hospital (meaning their discharge date has not yet been recorded).",
        "sql": "SELECT Patient_id, F_name, L_name, In_date FROM PATIENT WHERE Out_date IS NULL"
    },
    {
        "id": "query_3",
        "title": "3. Simple Aggregation (GROUP BY)",
        "description": "Counts the number of nurses assigned to each type of shift (e.g., Morning, Night, Evening).",
        "sql": "SELECT Shift_type, COUNT(Emp_id) AS Total_Nurses FROM NURSE GROUP BY Shift_type"
    },
    {
        "id": "query_4",
        "title": "4. Sorting Data (ORDER BY)",
        "description": "Retrieves a list of all employees over the age of 40, sorted from oldest to youngest.",
        "sql": "SELECT Emp_id, F_name, L_name, Age FROM EMPLOYEE WHERE Age > 40 ORDER BY Age DESC"
    },
    {
        "id": "query_5",
        "title": "5. Simple 2-Table JOIN",
        "description": "Fetches the names and clearance levels of all pharmacists by linking the base EMPLOYEE table with the PHARMACIST subclass table.",
        "sql": "SELECT e.F_name, e.L_name, p.Clearance_level FROM EMPLOYEE e JOIN PHARMACIST p ON e.Emp_id = p.Emp_id"
    }
]

def run_demo_query(query_id):
    """Executes one of the 5 pre-defined demonstration queries."""
    query_obj = next((q for q in DEMO_QUERIES if q["id"] == query_id), None)
    if not query_obj:
        raise ValueError(f"Query '{query_id}' not found.")
    
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

