const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// Get all departments
router.get('/', async (req, res) => {
  const depts = await Department.find();
  res.json(depts);
});

// Add department
router.post('/', async (req, res) => {
  try {
    const dept = new Department({ name: req.body.name });
    await dept.save();
    res.status(201).json(dept);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;