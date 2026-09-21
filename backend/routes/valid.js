import { Router } from 'express';
import { getDbWrapper } from '../db/wrapper.js';

const router = Router();

// GET all valid records
router.get('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const validRecords = db.prepare(`
      SELECT 
        v.P_id,
        p.F_name || ' ' || p.L_name AS Patient_Name,
        v.Valid
      FROM VALID v
      JOIN PATIENT p ON v.P_id = p.Patient_id
    `).all();
    res.json(validRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET valid record by patient ID
router.get('/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const validRecord = db.prepare(`
      SELECT 
        v.P_id,
        p.F_name || ' ' || p.L_name AS Patient_Name,
        v.Valid
      FROM VALID v
      JOIN PATIENT p ON v.P_id = p.Patient_id
      WHERE v.P_id = ?
    `).get(req.params.patientId);

    if (!validRecord) {
      return res.status(404).json({ error: 'Valid record not found' });
    }
    res.json(validRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new valid record
router.post('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { P_id, Valid } = req.body;

    db.prepare('INSERT INTO VALID (P_id, Valid) VALUES (?, ?)').run(P_id, Valid);

    const newValid = db.prepare('SELECT * FROM VALID WHERE P_id = ?').get(P_id);
    res.status(201).json(newValid);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update valid record
router.put('/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Valid } = req.body;

    db.prepare('UPDATE VALID SET Valid = ? WHERE P_id = ?').run(Valid, req.params.patientId);

    const updatedValid = db.prepare('SELECT * FROM VALID WHERE P_id = ?').get(req.params.patientId);
    res.json(updatedValid);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE valid record
router.delete('/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    db.prepare('DELETE FROM VALID WHERE P_id = ?').run(req.params.patientId);
    res.json({ message: 'Valid record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
