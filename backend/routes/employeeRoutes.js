const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// GET all employees
router.get('/', async (req, res) => {
  const employees = await Employee.find()
    .populate('department', 'name')
    .populate('designation', 'name');
  res.json(employees);
});

// POST - Add employee (with all validations)
router.post('/', async (req, res) => {
  try {
    const { code, name, department, designation, dob, doj, gender, salary } = req.body;

    // 1. Duplicate code check
    const existing = await Employee.findOne({ code });
    if (existing) return res.status(400).json({ error: 'Code already exists' });

    // 2. Name: alphabets only, max 50
    if (!/^[A-Za-z\s]+$/.test(name))
      return res.status(400).json({ error: 'Name must contain alphabets only' });
    if (name.length > 50)
      return res.status(400).json({ error: 'Name must not exceed 50 characters' });

    // 3. DOB: age must be >= 18
    const dobDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())
      ? age - 1 : age;
    if (actualAge < 18)
      return res.status(400).json({ error: 'Employee must be at least 18 years old' });

    // 4. DOJ: must not be future date
    const dojDate = new Date(doj);
    if (dojDate > today)
      return res.status(400).json({ error: 'Date of Joining cannot be a future date' });

    // 5. Salary: max 7 digits
    if (salary > 9999999.99)
      return res.status(400).json({ error: 'Salary must not exceed 7 digits' });

    const employee = new Employee({ code, name, department, designation, dob, doj, gender, salary });
    await employee.save();
    const saved = await Employee.findById(employee._id)
      .populate('department', 'name')
      .populate('designation', 'name');
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT - Update employee
router.put('/:id', async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('department', 'name')
      .populate('designation', 'name');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted successfully' });
});

module.exports = router;