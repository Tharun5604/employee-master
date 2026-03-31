const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  code: {
    type: Number,
    required: true,
    unique: true  // No duplicate codes
  },
  name: {
    type: String,
    required: true,
    maxlength: 50,
    match: /^[A-Za-z\s]+$/  // Alphabets only
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  designation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designation',
    required: true
  },
  dob: { type: Date, required: true },
  doj: { type: Date, required: true },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  salary: {
    type: Number,
    required: true,
    max: 9999999.99  // 7 digits with decimal
  },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);