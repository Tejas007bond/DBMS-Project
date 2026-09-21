import { Router } from 'express';
import { getDbWrapper } from '../db/wrapper.js';

const router = Router();

// GET all test reports
router.get('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const reportsRaw = db.prepare(`
      SELECT 
        tr.R_id,
        tr.Patient_id,
        tr.Test_type,
        tr.Result,
        p.F_name,
        p.L_name
      FROM TEST_REPORT tr
      JOIN PATIENT p ON tr.Patient_id = p.Patient_id
    `).all();
    
    const reports = reportsRaw.map(r => ({
      ...r,
      Patient_Name: `${r.F_name} ${r.L_name}`
    }));
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET test report by ID
router.get('/:rId/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const report = db.prepare(`
      SELECT 
        tr.R_id,
        tr.Patient_id,
        tr.Test_type,
        tr.Result,
        p.F_name,
        p.L_name
      FROM TEST_REPORT tr
      JOIN PATIENT p ON tr.Patient_id = p.Patient_id
      WHERE tr.R_id = ? AND tr.Patient_id = ?
    `).get(req.params.rId, req.params.patientId);

    if (!report) {
      return res.status(404).json({ error: 'Test report not found' });
    }
    
    res.json({
      ...report,
      Patient_Name: `${report.F_name} ${report.L_name}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new test report
router.post('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { R_id, Patient_id, Test_type, Result } = req.body;

    db.prepare('INSERT INTO TEST_REPORT (R_id, Patient_id, Test_type, Result) VALUES (?, ?, ?, ?)').run(R_id, Patient_id, Test_type, Result);

    const newReport = db.prepare('SELECT * FROM TEST_REPORT WHERE R_id = ? AND Patient_id = ?').get(R_id, Patient_id);
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update test report
router.put('/:rId/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Test_type, Result } = req.body;

    db.prepare('UPDATE TEST_REPORT SET Test_type = ?, Result = ? WHERE R_id = ? AND Patient_id = ?').run(Test_type, Result, req.params.rId, req.params.patientId);

    const updatedReport = db.prepare('SELECT * FROM TEST_REPORT WHERE R_id = ? AND Patient_id = ?').get(req.params.rId, req.params.patientId);
    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE test report
router.delete('/:rId/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    db.prepare('DELETE FROM TEST_REPORT WHERE R_id = ? AND Patient_id = ?').run(req.params.rId, req.params.patientId);
    res.json({ message: 'Test report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET test reports for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const reports = db.prepare(`
      SELECT 
        tr.R_id,
        tr.Patient_id,
        tr.Test_type,
        tr.Result,
        p.F_name || ' ' || p.L_name AS Patient_Name
      FROM TEST_REPORT tr
      JOIN PATIENT p ON tr.Patient_id = p.Patient_id
      WHERE tr.Patient_id = ?
    `).all(req.params.patientId);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
