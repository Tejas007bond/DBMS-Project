import { Router } from 'express';
import { getDbWrapper } from '../db/wrapper.js';

const router = Router();

// GET all pharmacists with employee info
router.get('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const pharmacists = db.prepare(`
      SELECT 
        ph.Emp_id,
        e.F_name,
        e.L_name,
        e.Gender,
        e.Address,
        e.Contact_no,
        e.Age,
        ph.Clearance_level
      FROM PHARMACIST ph
      JOIN EMPLOYEE e ON ph.Emp_id = e.Emp_id
    `).all();
    res.json(pharmacists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET pharmacist by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const pharmacist = db.prepare(`
      SELECT 
        ph.Emp_id,
        e.F_name,
        e.L_name,
        e.Gender,
        e.Address,
        e.Contact_no,
        e.Age,
        ph.Clearance_level
      FROM PHARMACIST ph
      JOIN EMPLOYEE e ON ph.Emp_id = e.Emp_id
      WHERE ph.Emp_id = ?
    `).get(req.params.id);

    if (!pharmacist) {
      return res.status(404).json({ error: 'Pharmacist not found' });
    }
    res.json(pharmacist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new pharmacist (creates employee + pharmacist record)
router.post('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Emp_id, F_name, L_name, Gender, Address, Contact_no, Age, Clearance_level } = req.body;

    db.prepare(
      'INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Gender, Address, Contact_no, Age) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(Emp_id, F_name, L_name, Gender, Address, Contact_no, Age);

    db.prepare('INSERT INTO PHARMACIST (Emp_id, Clearance_level) VALUES (?, ?)').run(Emp_id, Clearance_level);

    const newPharmacist = db.prepare('SELECT * FROM PHARMACIST WHERE Emp_id = ?').get(Emp_id);
    res.status(201).json(newPharmacist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update pharmacist
router.put('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { F_name, L_name, Gender, Address, Contact_no, Age, Clearance_level } = req.body;

    db.prepare(
      'UPDATE EMPLOYEE SET F_name = ?, L_name = ?, Gender = ?, Address = ?, Contact_no = ?, Age = ? WHERE Emp_id = ?'
    ).run(F_name, L_name, Gender, Address, Contact_no, Age, req.params.id);

    db.prepare('UPDATE PHARMACIST SET Clearance_level = ? WHERE Emp_id = ?').run(Clearance_level, req.params.id);

    const updatedPharmacist = db.prepare('SELECT * FROM PHARMACIST WHERE Emp_id = ?').get(req.params.id);
    res.json(updatedPharmacist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE pharmacist
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    db.prepare('DELETE FROM PHARMACIST WHERE Emp_id = ?').run(req.params.id);
    db.prepare('DELETE FROM EMPLOYEE WHERE Emp_id = ?').run(req.params.id);
    res.json({ message: 'Pharmacist deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET pharmacist's medical records handled
router.get('/:id/records', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const records = db.prepare(`
      SELECT 
        mr.R_id,
        p.F_name || ' ' || p.L_name AS Patient_Name,
        mr.Purchase_date,
        ph.Clearance_level
      FROM RECORD_HANDLER rh
      JOIN MEDICAL_RECORDS mr ON rh.P_id = mr.P_id AND rh.Purchase_date = mr.Purchase_date
      JOIN PHARMACIST ph ON rh.Emp_id = ph.Emp_id
      JOIN PATIENT p ON mr.P_id = p.Patient_id
      WHERE rh.Emp_id = ?
      ORDER BY mr.Purchase_date
    `).all(req.params.id);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
