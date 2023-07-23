const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Route for creating a new employee
router.post('/register', employeeController.createEmployee);

// Route for employee login
router.post('/login', employeeController.login);

// Route for getting all employees (accessible to all)
router.get('/', employeeController.getAllEmployees);

// Route for getting an employee by ID (accessible to all)
router.get('/:id', employeeController.getEmployeeById);

// Route for registering an employee for a hackathon
router.post('/register-for-hackathon', authenticateUser, employeeController.registerForHackathon);

// Route for getting all hackathons in which an employee is registered
router.get('/:id/registered-hackathons', authenticateUser, employeeController.getRegisteredHackathons);

// Route for updating employee details
router.put('/:id', authenticateUser, employeeController.updateEmployee);

// Route for deleting an employee
router.delete('/:id', authenticateUser, employeeController.deleteEmployee);

module.exports = router;
