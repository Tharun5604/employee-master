const express = require('express');
const router = express.Router();
const Designation = require('../models/Designation');

router.get('/', async (req, res) => {
  const desigs = await Designation.find();
  res.json(desigs);
});

router.post('/', async (req, res) => {
  try {
    const desig = new Designation({ name: req.body.name });
    await desig.save();
    res.status(201).json(desig);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;