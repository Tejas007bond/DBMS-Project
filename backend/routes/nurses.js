import { Router } from 'express';
import { getDbWrapper } from '../db/wrapper.js';

const router = Router();

// GET all nurses with employee info
router.get('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const nurses = db.prepare(`
      SELECT 
        n.Emp_id,
        e.F_name,
        e.L_name,
        e.Gender,
        e.Address,
        e.Contact_no,
        e.Age,
        n.Shift_type
      FROM NURSE n
      JOIN EMPLOYEE e ON n.Emp_id = e.Emp_id
    `).all();
    res.json(nurses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET nurse by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const nurse = db.prepare(`
      SELECT 
        n.Emp_id,
        e.F_name,
        e.L_name,
        e.Gender,
        e.Address,
        e.Contact_no,
        e.Age,
        n.Shift_type
      FROM NURSE n
      JOIN EMPLOYEE e ON n.Emp_id = e.Emp_id
      WHERE n.Emp_id = ?
    `).get(req.params.id);

    if (!nurse) {
      return res.status(404).json({ error: 'Nurse not found' });
    }
    res.json(nurse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new nurse (creates employee + nurse record)
router.post('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Emp_id, F_name, L_name, Gender, Address, Contact_no, Age, Shift_type } = req.body;

    db.prepare(
      'INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Gender, Address, Contact_no, Age) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(Emp_id, F_name, L_name, Gender, Address, Contact_no, Age);

    db.prepare('INSERT INTO NURSE (Emp_id, Shift_type) VALUES (?, ?)').run(Emp_id, Shift_type);

    const newNurse = db.prepare('SELECT * FROM NURSE WHERE Emp_id = ?').get(Emp_id);
    res.status(201).json(newNurse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update nurse
router.put('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { F_name, L_name, Gender, Address, Contact_no, Age, Shift_type } = req.body;

    db.prepare(
      'UPDATE EMPLOYEE SET F_name = ?, L_name = ?, Gender = ?, Address = ?, Contact_no = ?, Age = ? WHERE Emp_id = ?'
    ).run(F_name, L_name, Gender, Address, Contact_no, Age, req.params.id);

    db.prepare('UPDATE NURSE SET Shift_type = ? WHERE Emp_id = ?').run(Shift_type, req.params.id);

    const updatedNurse = db.prepare('SELECT * FROM NURSE WHERE Emp_id = ?').get(req.params.id);
    res.json(updatedNurse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE nurse
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    db.prepare('DELETE FROM NURSE WHERE Emp_id = ?').run(req.params.id);
    db.prepare('DELETE FROM EMPLOYEE WHERE Emp_id = ?').run(req.params.id);
    res.json({ message: 'Nurse deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET nurse room assignments
router.get('/:id/rooms', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const rooms = db.prepare(`
      SELECT 
        nhr.Room_no,
        r.Type AS Room_Type,
        rb.Availability
      FROM NURSE_HANDLES_ROOMS nhr
      JOIN ROOMS r ON nhr.Room_no = r.Room_no
      JOIN ROOMS_B rb ON r.Capacity = rb.Capacity
      WHERE nhr.Emp_id = ?
    `).all(req.params.id);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST assign nurse to room
router.post('/:id/rooms', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Room_no } = req.body;

    db.prepare('INSERT INTO NURSE_HANDLES_ROOMS (Emp_id, Room_no) VALUES (?, ?)').run(req.params.id, Room_no);
    res.status(201).json({ message: 'Nurse assigned to room successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE nurse from room
router.delete('/:id/rooms/:roomNo', async (req, res) => {
  try {
    const db = await getDbWrapper();
    db.prepare('DELETE FROM NURSE_HANDLES_ROOMS WHERE Emp_id = ? AND Room_no = ?').run(req.params.id, req.params.roomNo);
    res.json({ message: 'Nurse removed from room successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET nurse shift distribution
router.get('/stats/shifts', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const stats = db.prepare(`
      SELECT Shift_type, COUNT(Emp_id) AS Total_Nurses
      FROM NURSE
      GROUP BY Shift_type
    `).all();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
