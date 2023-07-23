const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');
const authenticateToken = require('../middleware/auth');

// List all Active/Past/Upcoming Hackathons with pagination
router.get('/hackathons', authenticateToken, hackathonController.listHackathons);

// Search Hackathons by Name, Company, Technology Stack
router.get('/hackathons/search', authenticateToken, hackathonController.searchHackathons);

// Get Hackathon details by ID
router.get('/hackathons/:hackathonId', authenticateToken, hackathonController.getHackathonById);

// List all hackathons participated by an employee
router.get('/employees/:employeeId/hackathons', authenticateToken, hackathonController.listParticipatedHackathons);

module.exports = router;
