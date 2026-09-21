import { Router } from 'express';
import { getDbWrapper } from '../db/wrapper.js';

const router = Router();

// GET all persons (dependents)
router.get('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const persons = db.prepare(`
      SELECT 
        per.Patient_id,
        per.Name,
        per.Sex,
        per.Age,
        per.Relationship,
        p.F_name || ' ' || p.L_name AS Patient_Name
      FROM PERSONS per
      JOIN PATIENT p ON per.Patient_id = p.Patient_id
    `).all();
    res.json(persons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET person by patient ID and name
router.get('/:patientId/:name', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const person = db.prepare(`
      SELECT 
        per.Patient_id,
        per.Name,
        per.Sex,
        per.Age,
        per.Relationship,
        p.F_name || ' ' || p.L_name AS Patient_Name
      FROM PERSONS per
      JOIN PATIENT p ON per.Patient_id = p.Patient_id
      WHERE per.Patient_id = ? AND per.Name = ?
    `).get(req.params.patientId, decodeURIComponent(req.params.name));

    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    res.json(person);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new person (dependent)
router.post('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Patient_id, Name, Sex, Age, Relationship } = req.body;

    db.prepare('INSERT INTO PERSONS (Patient_id, Name, Sex, Age, Relationship) VALUES (?, ?, ?, ?, ?)').run(Patient_id, Name, Sex, Age, Relationship);

    const newPerson = db.prepare('SELECT * FROM PERSONS WHERE Patient_id = ? AND Name = ?').get(Patient_id, Name);
    res.status(201).json(newPerson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update person
router.put('/:patientId/:name', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Sex, Age, Relationship } = req.body;

    db.prepare('UPDATE PERSONS SET Sex = ?, Age = ?, Relationship = ? WHERE Patient_id = ? AND Name = ?').run(Sex, Age, Relationship, req.params.patientId, decodeURIComponent(req.params.name));

    const updatedPerson = db.prepare('SELECT * FROM PERSONS WHERE Patient_id = ? AND Name = ?').get(req.params.patientId, decodeURIComponent(req.params.name));
    res.json(updatedPerson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE person
router.delete('/:patientId/:name', async (req, res) => {
  try {
    const db = await getDbWrapper();
    db.prepare('DELETE FROM PERSONS WHERE Patient_id = ? AND Name = ?').run(req.params.patientId, decodeURIComponent(req.params.name));
    res.json({ message: 'Person deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all dependents for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const dependents = db.prepare(`
      SELECT 
        per.Patient_id,
        per.Name,
        per.Sex,
        per.Age,
        per.Relationship
      FROM PERSONS per
      WHERE per.Patient_id = ?
    `).all(req.params.patientId);
    res.json(dependents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
