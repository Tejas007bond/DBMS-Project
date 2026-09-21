import { Router } from 'express';
import { getDbWrapper } from '../db/wrapper.js';

const router = Router();

// GET all doctors with employee info
router.get('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const doctors = db.prepare(`
      SELECT 
        d.Emp_id,
        e.F_name,
        e.L_name,
        e.Gender,
        e.Address,
        e.Contact_no,
        e.Age,
        d.Specialization,
        d.Designation,
        d.Supervisor_id
      FROM DOCTOR d
      JOIN EMPLOYEE e ON d.Emp_id = e.Emp_id
    `).all();
    
    // Get supervisor names separately
    const doctorsWithSupervisors = doctors.map(doc => {
      let supervisorName = null;
      if (doc.Supervisor_id) {
        const sup = db.prepare('SELECT F_name, L_name FROM EMPLOYEE WHERE Emp_id = ?').get(doc.Supervisor_id);
        supervisorName = sup ? `${sup.F_name} ${sup.L_name}` : null;
      }
      return { ...doc, Supervisor_Name: supervisorName };
    });
    
    res.json(doctorsWithSupervisors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const doctor = db.prepare(`
      SELECT 
        d.Emp_id,
        e.F_name,
        e.L_name,
        e.Gender,
        e.Address,
        e.Contact_no,
        e.Age,
        d.Specialization,
        d.Designation,
        d.Supervisor_id
      FROM DOCTOR d
      JOIN EMPLOYEE e ON d.Emp_id = e.Emp_id
      WHERE d.Emp_id = ?
    `).get(req.params.id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Get supervisor name
    let supervisorName = null;
    if (doctor.Supervisor_id) {
      const sup = db.prepare('SELECT F_name, L_name FROM EMPLOYEE WHERE Emp_id = ?').get(doctor.Supervisor_id);
      supervisorName = sup ? `${sup.F_name} ${sup.L_name}` : null;
    }
    
    res.json({ ...doctor, Supervisor_Name: supervisorName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new doctor (creates employee + doctor record)
router.post('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Emp_id, F_name, L_name, Gender, Address, Contact_no, Age, Specialization, Designation, Supervisor_id } = req.body;

    db.prepare(
      'INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Gender, Address, Contact_no, Age) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(Emp_id, F_name, L_name, Gender, Address, Contact_no, Age);

    db.prepare(
      'INSERT INTO DOCTOR (Emp_id, Specialization, Designation, Supervisor_id) VALUES (?, ?, ?, ?)'
    ).run(Emp_id, Specialization, Designation, Supervisor_id || null);

    const newDoctor = db.prepare('SELECT * FROM DOCTOR WHERE Emp_id = ?').get(Emp_id);
    res.status(201).json(newDoctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update doctor
router.put('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { F_name, L_name, Gender, Address, Contact_no, Age, Specialization, Designation, Supervisor_id } = req.body;

    db.prepare(
      'UPDATE EMPLOYEE SET F_name = ?, L_name = ?, Gender = ?, Address = ?, Contact_no = ?, Age = ? WHERE Emp_id = ?'
    ).run(F_name, L_name, Gender, Address, Contact_no, Age, req.params.id);

    db.prepare(
      'UPDATE DOCTOR SET Specialization = ?, Designation = ?, Supervisor_id = ? WHERE Emp_id = ?'
    ).run(Specialization, Designation, Supervisor_id || null, req.params.id);

    const updatedDoctor = db.prepare('SELECT * FROM DOCTOR WHERE Emp_id = ?').get(req.params.id);
    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE doctor
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    db.prepare('DELETE FROM DOCTOR WHERE Emp_id = ?').run(req.params.id);
    db.prepare('DELETE FROM EMPLOYEE WHERE Emp_id = ?').run(req.params.id);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
