import { Router } from 'express';
import { getDbWrapper } from '../db/wrapper.js';

const router = Router();

// GET dashboard statistics
router.get('/', async (req, res) => {
  try {
    const db = await getDbWrapper();

    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM PATIENT').get().count;
    const currentPatients = db.prepare('SELECT COUNT(*) as count FROM PATIENT WHERE Out_date IS NULL').get().count;
    const totalDoctors = db.prepare('SELECT COUNT(*) as count FROM DOCTOR').get().count;
    const totalNurses = db.prepare('SELECT COUNT(*) as count FROM NURSE').get().count;
    const totalPharmacists = db.prepare('SELECT COUNT(*) as count FROM PHARMACIST').get().count;
    const totalRooms = db.prepare('SELECT COUNT(*) as count FROM ROOMS').get().count;
    const availableRooms = db.prepare(`
      SELECT COUNT(*) as count 
      FROM ROOMS r 
      JOIN ROOMS_B rb ON r.Capacity = rb.Capacity 
      WHERE rb.Availability = 'Available'
    `).get().count;
    const totalAppointments = db.prepare('SELECT COUNT(*) as count FROM APPOINTMENT').get().count;
    const totalBillsResult = db.prepare('SELECT SUM(Amount) as total FROM BILLS').get();
    const totalInsuranceResult = db.prepare('SELECT SUM(I_amount) as total FROM BILLS').get();
    const patientsByGender = db.prepare(`
      SELECT Gender, COUNT(*) as count 
      FROM PATIENT 
      GROUP BY Gender
    `).all();
    const nursesByShift = db.prepare(`
      SELECT Shift_type, COUNT(*) as count 
      FROM NURSE 
      GROUP BY Shift_type
    `).all();
    const roomsByType = db.prepare(`
      SELECT Type, COUNT(*) as count 
      FROM ROOMS 
      GROUP BY Type
    `).all();

    const stats = {
      totalPatients,
      currentPatients,
      totalDoctors,
      totalNurses,
      totalPharmacists,
      totalRooms,
      availableRooms,
      totalAppointments,
      totalBills: totalBillsResult?.total || 0,
      totalInsurance: totalInsuranceResult?.total || 0,
      patientsByGender,
      nursesByShift,
      roomsByType,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET date-based statistics
router.get('/admissions', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const admissions = db.prepare(`
      SELECT 
        In_date,
        COUNT(*) as count
      FROM PATIENT
      GROUP BY In_date
      ORDER BY In_date
    `).all();
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET discharge statistics
router.get('/discharges', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const discharges = db.prepare(`
      SELECT 
        Out_date,
        COUNT(*) as count
      FROM PATIENT
      WHERE Out_date IS NOT NULL
      GROUP BY Out_date
      ORDER BY Out_date
    `).all();
    res.json(discharges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
