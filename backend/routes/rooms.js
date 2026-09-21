import { Router } from 'express';
import { getDbWrapper } from '../db/wrapper.js';

const router = Router();

// GET all rooms with availability
router.get('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const rooms = db.prepare(`
      SELECT 
        r.Room_no,
        r.Capacity,
        r.Type,
        rb.Availability
      FROM ROOMS r
      JOIN ROOMS_B rb ON r.Capacity = rb.Capacity
    `).all();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET room by number
router.get('/:roomNo', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const room = db.prepare(`
      SELECT 
        r.Room_no,
        r.Capacity,
        r.Type,
        rb.Availability
      FROM ROOMS r
      JOIN ROOMS_B rb ON r.Capacity = rb.Capacity
      WHERE r.Room_no = ?
    `).get(req.params.roomNo);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new room
router.post('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Room_no, Capacity, Type, Availability } = req.body;

    db.prepare('INSERT OR IGNORE INTO ROOMS_B (Capacity, Availability) VALUES (?, ?)').run(Capacity, Availability);
    db.prepare('INSERT INTO ROOMS (Room_no, Capacity, Type) VALUES (?, ?, ?)').run(Room_no, Capacity, Type);

    const newRoom = db.prepare('SELECT * FROM ROOMS WHERE Room_no = ?').get(Room_no);
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update room
router.put('/:roomNo', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Capacity, Type, Availability } = req.body;

    db.prepare('UPDATE ROOMS SET Capacity = ?, Type = ? WHERE Room_no = ?').run(Capacity, Type, req.params.roomNo);
    db.prepare('UPDATE ROOMS_B SET Availability = ? WHERE Capacity = ?').run(Availability, Capacity);

    const updatedRoom = db.prepare('SELECT * FROM ROOMS WHERE Room_no = ?').get(req.params.roomNo);
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE room
router.delete('/:roomNo', async (req, res) => {
  try {
    const db = await getDbWrapper();
    db.prepare('DELETE FROM ROOMS WHERE Room_no = ?').run(req.params.roomNo);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET room with assigned patients
router.get('/:roomNo/patients', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const patients = db.prepare(`
      SELECT 
        p.Patient_id,
        p.F_name,
        p.L_name,
        p.Phone
      FROM PATIENT p
      JOIN PATIENT_B pb ON p.Phone = pb.Phone
      JOIN PATIENT_C pc ON pb.Address = pc.Address
      WHERE pc.Room_no = ?
    `).all(req.params.roomNo);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET room with assigned nurses
router.get('/:roomNo/nurses', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const nurses = db.prepare(`
      SELECT 
        n.Emp_id,
        e.F_name,
        e.L_name,
        n.Shift_type
      FROM NURSE_HANDLES_ROOMS nhr
      JOIN NURSE n ON nhr.Emp_id = n.Emp_id
      JOIN EMPLOYEE e ON n.Emp_id = e.Emp_id
      WHERE nhr.Room_no = ?
    `).all(req.params.roomNo);
    res.json(nurses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
