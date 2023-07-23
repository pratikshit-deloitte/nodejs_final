const Employee = require('../models/employeeModel');
const Hackathon = require('../models/hackathonModel');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

// Create a new employee
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const employee = new Employee({ name, email, password });
    await employee.save();
    res.status(201).json({ message: 'Employee created successfully!', employee });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create employee.', details: err.message });
  }
};

// Login an employee and generate a JWT token
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email });

    if (!employee || employee.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: employee._id, email: employee.email }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful!', token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log in.', details: err.message });
  }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}, '-password');
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees.', details: err.message });
  }
};

// Get an employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employeeId = req.params.id;

    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({ error: 'Invalid employee ID.' });
    }

    const employee = await Employee.findById(employeeId, '-password');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employee.', details: err.message });
  }
};

// Register an employee for a hackathon
exports.registerForHackathon = async (req, res) => {
  try {
    const { employeeId, hackathonId } = req.body;

    // Check if the hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found.' });
    }

    // Check if the hackathon registration is open
    if (!hackathon.registrationOpen) {
      return res.status(400).json({ error: 'Hackathon registration is closed.' });
    }

    // Check if the employee is already registered for the hackathon
    if (hackathon.participants.includes(employeeId)) {
      return res.status(400).json({ error: 'Employee is already registered for the hackathon.' });
    }

    // Add the employee to the hackathon participants
    hackathon.participants.push(employeeId);
    await hackathon.save();

    res.status(200).json({ message: 'Employee registered for the hackathon successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register for the hackathon.', details: err.message });
  }
};

// Get all hackathons in which an employee is registered
exports.getRegisteredHackathons = async (req, res) => {
  try {
    const employeeId = req.params.id;

    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({ error: 'Invalid employee ID.' });
    }

    const hackathons = await Hackathon.find({ participants: employeeId });

    res.status(200).json(hackathons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hackathons.', details: err.message });
  }
};

// Update employee details
exports.updateEmployee = async (req, res) => {
  try {
    const { name, email } = req.body;
    const employeeId = req.params.id;

    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({ error: 'Invalid employee ID.' });
    }

    const employee = await Employee.findByIdAndUpdate(employeeId, { name, email }, { new: true });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.status(200).json({ message: 'Employee details updated successfully!', employee });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update employee details.', details: err.message });
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({ error: 'Invalid employee ID.' });
    }

    const employee = await Employee.findByIdAndDelete(employeeId);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.status(200).json({ message: 'Employee deleted successfully!', employee });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete employee.', details: err.message });
  }
};
