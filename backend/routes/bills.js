import { Router } from 'express';
import { getDbWrapper } from '../db/wrapper.js';

const router = Router();

// GET all bills with patient info
router.get('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const billsRaw = db.prepare(`
      SELECT 
        b.B_id,
        b.P_id,
        b.Amount,
        b.I_amount,
        p.F_name,
        p.L_name,
        v.Valid
      FROM BILLS b
      JOIN PATIENT p ON b.P_id = p.Patient_id
      JOIN VALID v ON b.P_id = v.P_id
    `).all();
    
    const bills = billsRaw.map(b => ({
      ...b,
      Patient_Name: `${b.F_name} ${b.L_name}`,
      Insurance_Coverage_Pct: b.Amount === 0 ? 0 : Math.round((b.I_amount / b.Amount) * 10000) / 100
    }));
    
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET bill by ID
router.get('/:id/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const bill = db.prepare(`
      SELECT 
        b.B_id,
        b.P_id,
        b.Amount,
        b.I_amount,
        p.F_name,
        p.L_name,
        v.Valid
      FROM BILLS b
      JOIN PATIENT p ON b.P_id = p.Patient_id
      JOIN VALID v ON b.P_id = v.P_id
      WHERE b.B_id = ? AND b.P_id = ?
    `).get(req.params.id, req.params.patientId);

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    res.json({
      ...bill,
      Patient_Name: `${bill.F_name} ${bill.L_name}`,
      Insurance_Coverage_Pct: bill.Amount === 0 ? 0 : Math.round((bill.I_amount / bill.Amount) * 10000) / 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new bill
router.post('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { B_id, P_id, Amount, I_amount } = req.body;

    db.prepare('INSERT INTO BILLS (B_id, P_id, Amount, I_amount) VALUES (?, ?, ?, ?)').run(B_id, P_id, Amount, I_amount);

    const newBill = db.prepare('SELECT * FROM BILLS WHERE B_id = ? AND P_id = ?').get(B_id, P_id);
    res.status(201).json(newBill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update bill
router.put('/:id/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Amount, I_amount } = req.body;

    db.prepare('UPDATE BILLS SET Amount = ?, I_amount = ? WHERE B_id = ? AND P_id = ?').run(Amount, I_amount, req.params.id, req.params.patientId);

    const updatedBill = db.prepare('SELECT * FROM BILLS WHERE B_id = ? AND P_id = ?').get(req.params.id, req.params.patientId);
    res.json(updatedBill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE bill
router.delete('/:id/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    db.prepare('DELETE FROM BILLS WHERE B_id = ? AND P_id = ?').run(req.params.id, req.params.patientId);
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET bills exceeding average
router.get('/stats/above-average', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const bills = db.prepare(`
      SELECT B_id, P_id, Amount, I_amount
      FROM BILLS
      WHERE Amount > (SELECT AVG(Amount) FROM BILLS)
    `).all();
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET patient bills summary
router.get('/patient/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const summary = db.prepare(`
      SELECT 
        p.Patient_id,
        p.F_name,
        p.L_name,
        SUM(b.Amount) AS Total_Billed,
        SUM(b.I_amount) AS Total_Insurance
      FROM PATIENT p
      JOIN BILLS b ON p.Patient_id = b.P_id
      WHERE p.Patient_id = ?
      GROUP BY p.Patient_id, p.F_name, p.L_name
    `).get(req.params.patientId);

    if (!summary) {
      return res.status(404).json({ error: 'No bills found for patient' });
    }
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
