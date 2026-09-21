import { Router } from 'express';
import { getDbWrapper } from '../db/wrapper.js';

const router = Router();

// GET all patients with full details
router.get('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const patients = db.prepare(`
      SELECT 
        p.Patient_id,
        p.F_name,
        p.L_name,
        p.Gender,
        p.Phone,
        p.In_date,
        p.Out_date,
        pc.Address,
        pc.Room_no,
        r.Type AS Room_Type,
        rb.Availability AS Room_Availability,
        v.Valid
      FROM PATIENT p
      LEFT JOIN PATIENT_B pb ON p.Phone = pb.Phone
      LEFT JOIN PATIENT_C pc ON pb.Address = pc.Address
      LEFT JOIN ROOMS r ON pc.Room_no = r.Room_no
      LEFT JOIN ROOMS_B rb ON r.Capacity = rb.Capacity
      LEFT JOIN VALID v ON p.Patient_id = v.P_id
    `).all();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET patient by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const patient = db.prepare(`
      SELECT 
        p.Patient_id,
        p.F_name,
        p.L_name,
        p.Gender,
        p.Phone,
        p.In_date,
        p.Out_date,
        pc.Address,
        pc.Room_no,
        r.Type AS Room_Type,
        rb.Availability AS Room_Availability,
        v.Valid
      FROM PATIENT p
      LEFT JOIN PATIENT_B pb ON p.Phone = pb.Phone
      LEFT JOIN PATIENT_C pc ON pb.Address = pc.Address
      LEFT JOIN ROOMS r ON pc.Room_no = r.Room_no
      LEFT JOIN ROOMS_B rb ON r.Capacity = rb.Capacity
      LEFT JOIN VALID v ON p.Patient_id = v.P_id
      WHERE p.Patient_id = ?
    `).get(req.params.id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new patient
router.post('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date, Address, Room_no, Valid } = req.body;

    // Insert into PATIENT_C (Address, Room_no)
    if (Address && Room_no) {
      db.prepare('INSERT OR IGNORE INTO PATIENT_C (Address, Room_no) VALUES (?, ?)').run(Address, Room_no);
    }

    // Insert into PATIENT_B (Phone, Address)
    if (Phone && Address) {
      db.prepare('INSERT OR IGNORE INTO PATIENT_B (Phone, Address) VALUES (?, ?)').run(Phone, Address);
    }

    // Insert into PATIENT
    db.prepare(
      'INSERT INTO PATIENT (Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(Patient_id, F_name, L_name, Gender, Phone, In_date, Out_date || null);

    // Insert into VALID
    if (Valid) {
      db.prepare('INSERT OR IGNORE INTO VALID (P_id, Valid) VALUES (?, ?)').run(Patient_id, Valid);
    }

    const newPatient = db.prepare('SELECT * FROM PATIENT WHERE Patient_id = ?').get(Patient_id);
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update patient
router.put('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { F_name, L_name, Gender, Phone, In_date, Out_date, Address, Room_no, Valid } = req.body;

    db.prepare(
      'UPDATE PATIENT SET F_name = ?, L_name = ?, Gender = ?, Phone = ?, In_date = ?, Out_date = ? WHERE Patient_id = ?'
    ).run(F_name, L_name, Gender, Phone, In_date, Out_date || null, req.params.id);

    if (Address && Room_no) {
      db.prepare('INSERT OR REPLACE INTO PATIENT_C (Address, Room_no) VALUES (?, ?)').run(Address, Room_no);
      db.prepare('INSERT OR REPLACE INTO PATIENT_B (Phone, Address) VALUES (?, ?)').run(Phone, Address);
    }

    if (Valid) {
      db.prepare('INSERT OR REPLACE INTO VALID (P_id, Valid) VALUES (?, ?)').run(req.params.id, Valid);
    }

    const updatedPatient = db.prepare('SELECT * FROM PATIENT WHERE Patient_id = ?').get(req.params.id);
    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE patient
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    db.prepare('DELETE FROM PERSONS WHERE Patient_id = ?').run(req.params.id);
    db.prepare('DELETE FROM TEST_REPORT WHERE Patient_id = ?').run(req.params.id);
    db.prepare('DELETE FROM BILLS WHERE P_id = ?').run(req.params.id);
    db.prepare('DELETE FROM VALID WHERE P_id = ?').run(req.params.id);
    db.prepare('DELETE FROM MEDICAL_RECORDS WHERE P_id = ?').run(req.params.id);
    db.prepare('DELETE FROM RECORD_HANDLER WHERE P_id = ?').run(req.params.id);
    db.prepare('DELETE FROM APPOINTMENT WHERE P_id = ?').run(req.params.id);
    db.prepare('DELETE FROM Appointment_B WHERE P_id = ?').run(req.params.id);
    db.prepare('DELETE FROM PATIENT WHERE Patient_id = ?').run(req.params.id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET patient dependents (persons)
router.get('/:id/dependents', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const dependents = db.prepare('SELECT * FROM PERSONS WHERE Patient_id = ?').all(req.params.id);
    res.json(dependents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET patient consultations
router.get('/consultations', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const consultations = db.prepare(`
      SELECT 
        p.Patient_id,
        p.F_name || ' ' || p.L_name AS Patient_Name,
        e.F_name || ' ' || e.L_name AS Doctor_Name,
        d.Specialization
      FROM PATIENT p
      JOIN Appointment_B ab ON p.Patient_id = ab.P_id
      JOIN DOCTOR d ON ab.D_id = d.Emp_id
      JOIN EMPLOYEE e ON d.Emp_id = e.Emp_id
      ORDER BY p.Patient_id
    `).all();
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET currently admitted patients
router.get('/admitted/current', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const patients = db.prepare(`
      SELECT 
        Patient_id,
        F_name || ' ' || L_name AS Patient_Name,
        Gender,
        Phone,
        In_date
      FROM PATIENT
      WHERE Out_date IS NULL
    `).all();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
