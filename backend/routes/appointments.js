import { Router } from 'express';
import { getDbWrapper } from '../db/wrapper.js';

const router = Router();

// GET all appointments with patient and doctor info
router.get('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const appointments = db.prepare(`
      SELECT 
        a.Id,
        a.App_date,
        a.P_id,
        p.F_name || ' ' || p.L_name AS Patient_Name
      FROM APPOINTMENT a
      JOIN PATIENT p ON a.P_id = p.Patient_id
    `).all();
    
    // Get doctor info for each appointment
    const appointmentsWithDoctors = appointments.map(app => {
      const ab = db.prepare('SELECT D_id FROM Appointment_B WHERE P_id = ?').get(app.P_id);
      let doctorName = null;
      let specialization = null;
      if (ab) {
        const doc = db.prepare(`
          SELECT e.F_name, e.L_name, d.Specialization
          FROM DOCTOR d
          JOIN EMPLOYEE e ON d.Emp_id = e.Emp_id
          WHERE d.Emp_id = ?
        `).get(ab.D_id);
        if (doc) {
          doctorName = `${doc.F_name} ${doc.L_name}`;
          specialization = doc.Specialization;
        }
      }
      return { ...app, D_id: ab?.D_id || null, Doctor_Name: doctorName, Specialization: specialization };
    });
    
    res.json(appointmentsWithDoctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const appointment = db.prepare(`
      SELECT 
        a.Id,
        a.App_date,
        a.P_id,
        p.F_name || ' ' || p.L_name AS Patient_Name
      FROM APPOINTMENT a
      JOIN PATIENT p ON a.P_id = p.Patient_id
      WHERE a.Id = ?
    `).get(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const ab = db.prepare('SELECT D_id FROM Appointment_B WHERE P_id = ?').get(appointment.P_id);
    let doctorName = null;
    let specialization = null;
    if (ab) {
      const doc = db.prepare(`
        SELECT e.F_name, e.L_name, d.Specialization
        FROM DOCTOR d
        JOIN EMPLOYEE e ON d.Emp_id = e.Emp_id
        WHERE d.Emp_id = ?
      `).get(ab.D_id);
      if (doc) {
        doctorName = `${doc.F_name} ${doc.L_name}`;
        specialization = doc.Specialization;
      }
    }
    
    res.json({ ...appointment, D_id: ab?.D_id || null, Doctor_Name: doctorName, Specialization: specialization });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new appointment
router.post('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Id, App_date, P_id, D_id } = req.body;

    db.prepare('INSERT INTO APPOINTMENT (Id, App_date, P_id) VALUES (?, ?, ?)').run(Id, App_date, P_id);

    if (D_id) {
      db.prepare('INSERT OR REPLACE INTO Appointment_B (P_id, D_id) VALUES (?, ?)').run(P_id, D_id);
    }

    const newAppointment = db.prepare('SELECT * FROM APPOINTMENT WHERE Id = ?').get(Id);
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update appointment
router.put('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { App_date, P_id, D_id } = req.body;

    db.prepare('UPDATE APPOINTMENT SET App_date = ?, P_id = ? WHERE Id = ?').run(App_date, P_id, req.params.id);

    if (D_id) {
      db.prepare('DELETE FROM Appointment_B WHERE P_id = ?').run(P_id);
      db.prepare('INSERT INTO Appointment_B (P_id, D_id) VALUES (?, ?)').run(P_id, D_id);
    }

    const updatedAppointment = db.prepare('SELECT * FROM APPOINTMENT WHERE Id = ?').get(req.params.id);
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE appointment
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const app = db.prepare('SELECT P_id FROM APPOINTMENT WHERE Id = ?').get(req.params.id);
    if (app) {
      db.prepare('DELETE FROM Appointment_B WHERE P_id = ?').run(app.P_id);
    }
    db.prepare('DELETE FROM APPOINTMENT WHERE Id = ?').run(req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
