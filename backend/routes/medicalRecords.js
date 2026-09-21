import { Router } from 'express';
import { getDbWrapper } from '../db/wrapper.js';

const router = Router();

// GET all medical records with handler info
router.get('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const records = db.prepare(`
      SELECT 
        mr.R_id,
        mr.P_id,
        p.F_name || ' ' || p.L_name AS Patient_Name,
        mr.Purchase_date,
        rh.Emp_id AS Handler_Id,
        e.F_name || ' ' || e.L_name AS Pharmacist_Name,
        ph.Clearance_level
      FROM MEDICAL_RECORDS mr
      JOIN PATIENT p ON mr.P_id = p.Patient_id
      LEFT JOIN RECORD_HANDLER rh ON mr.P_id = rh.P_id AND mr.Purchase_date = rh.Purchase_date
      LEFT JOIN PHARMACIST ph ON rh.Emp_id = ph.Emp_id
      LEFT JOIN EMPLOYEE e ON ph.Emp_id = e.Emp_id
    `).all();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET medical record by ID
router.get('/:rId/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const record = db.prepare(`
      SELECT 
        mr.R_id,
        mr.P_id,
        p.F_name || ' ' || p.L_name AS Patient_Name,
        mr.Purchase_date,
        rh.Emp_id AS Handler_Id,
        e.F_name || ' ' || e.L_name AS Pharmacist_Name,
        ph.Clearance_level
      FROM MEDICAL_RECORDS mr
      JOIN PATIENT p ON mr.P_id = p.Patient_id
      LEFT JOIN RECORD_HANDLER rh ON mr.P_id = rh.P_id AND mr.Purchase_date = rh.Purchase_date
      LEFT JOIN PHARMACIST ph ON rh.Emp_id = ph.Emp_id
      LEFT JOIN EMPLOYEE e ON ph.Emp_id = e.Emp_id
      WHERE mr.R_id = ? AND mr.P_id = ?
    `).get(req.params.rId, req.params.patientId);

    if (!record) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new medical record
router.post('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { R_id, P_id, Purchase_date, Emp_id } = req.body;

    db.prepare('INSERT INTO MEDICAL_RECORDS (R_id, P_id, Purchase_date) VALUES (?, ?, ?)').run(R_id, P_id, Purchase_date);

    if (Emp_id) {
      db.prepare('INSERT INTO RECORD_HANDLER (P_id, Purchase_date, Emp_id) VALUES (?, ?, ?)').run(P_id, Purchase_date, Emp_id);
    }

    const newRecord = db.prepare('SELECT * FROM MEDICAL_RECORDS WHERE R_id = ? AND P_id = ?').get(R_id, P_id);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update medical record
router.put('/:rId/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Purchase_date, Emp_id } = req.body;

    db.prepare('UPDATE MEDICAL_RECORDS SET Purchase_date = ? WHERE R_id = ? AND P_id = ?').run(Purchase_date, req.params.rId, req.params.patientId);

    if (Emp_id) {
      db.prepare('DELETE FROM RECORD_HANDLER WHERE P_id = ?').run(req.params.patientId);
      db.prepare('INSERT INTO RECORD_HANDLER (P_id, Purchase_date, Emp_id) VALUES (?, ?, ?)').run(req.params.patientId, Purchase_date, Emp_id);
    }

    const updatedRecord = db.prepare('SELECT * FROM MEDICAL_RECORDS WHERE R_id = ? AND P_id = ?').get(req.params.rId, req.params.patientId);
    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE medical record
router.delete('/:rId/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    db.prepare('DELETE FROM RECORD_HANDLER WHERE P_id = ?').run(req.params.patientId);
    db.prepare('DELETE FROM MEDICAL_RECORDS WHERE R_id = ? AND P_id = ?').run(req.params.rId, req.params.patientId);
    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET medical records for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const records = db.prepare(`
      SELECT 
        mr.R_id,
        mr.P_id,
        p.F_name || ' ' || p.L_name AS Patient_Name,
        mr.Purchase_date,
        rh.Emp_id AS Handler_Id,
        e.F_name || ' ' || e.L_name AS Pharmacist_Name,
        ph.Clearance_level
      FROM MEDICAL_RECORDS mr
      JOIN PATIENT p ON mr.P_id = p.Patient_id
      LEFT JOIN RECORD_HANDLER rh ON mr.P_id = rh.P_id AND mr.Purchase_date = rh.Purchase_date
      LEFT JOIN PHARMACIST ph ON rh.Emp_id = ph.Emp_id
      LEFT JOIN EMPLOYEE e ON ph.Emp_id = e.Emp_id
      WHERE mr.P_id = ?
    `).all(req.params.patientId);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
