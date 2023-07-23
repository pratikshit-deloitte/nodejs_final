const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const organizerController = require('../controllers/organizerController');
const authenticateToken = require('../middleware/auth');

// Register as an Organizer (No JWT token verification needed for registration)
router.post('/register', employeeController.registerOrganizer);

// Login as an Organizer (No JWT token verification needed for login)
router.post('/login', employeeController.loginOrganizer);

// Host a Hackathon (Requires JWT token verification for organizers)
router.post('/host', authenticateToken, organizerController.hostHackathon);

// Update a Hackathon (Requires JWT token verification for organizers)
router.put('/hackathons/:hackathonId', authenticateToken, organizerController.updateHackathon);

// Delete a Hackathon (Requires JWT token verification for organizers)
router.delete('/hackathons/:hackathonId', authenticateToken, organizerController.deleteHackathon);

// List all hosted Hackathons by the Organizer
router.get('/hackathons', authenticateToken, organizerController.listHostedHackathons);

// List all participants of a Hackathon hosted by the Organizer
router.get('/hackathons/:hackathonId/participants', authenticateToken, organizerController.listParticipants);

module.exports = router;
