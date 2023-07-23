// models/employeeModel.js

const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  experienceLevel: { type: String, required: true },
  technologyStack: { type: String, required: true },
  businessUnit: { type: String, required: true },
  isOrganizer: { type: Boolean, default: false },
  hackathons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon' }],
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
