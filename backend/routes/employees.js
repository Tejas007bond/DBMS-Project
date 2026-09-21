import { Router } from 'express';
import { getDbWrapper } from '../db/wrapper.js';

const router = Router();

// GET all employees
router.get('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const employees = db.prepare('SELECT * FROM EMPLOYEE').all();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET employee by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const employee = db.prepare('SELECT * FROM EMPLOYEE WHERE Emp_id = ?').get(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new employee
router.post('/', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { Emp_id, F_name, L_name, Gender, Address, Contact_no, Age } = req.body;

    db.prepare(
      'INSERT INTO EMPLOYEE (Emp_id, F_name, L_name, Gender, Address, Contact_no, Age) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(Emp_id, F_name, L_name, Gender, Address, Contact_no, Age);

    const newEmployee = db.prepare('SELECT * FROM EMPLOYEE WHERE Emp_id = ?').get(Emp_id);
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update employee
router.put('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    const { F_name, L_name, Gender, Address, Contact_no, Age } = req.body;

    db.prepare(
      'UPDATE EMPLOYEE SET F_name = ?, L_name = ?, Gender = ?, Address = ?, Contact_no = ?, Age = ? WHERE Emp_id = ?'
    ).run(F_name, L_name, Gender, Address, Contact_no, Age, req.params.id);

    const updatedEmployee = db.prepare('SELECT * FROM EMPLOYEE WHERE Emp_id = ?').get(req.params.id);
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDbWrapper();
    db.prepare('DELETE FROM EMPLOYEE WHERE Emp_id = ?').run(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
