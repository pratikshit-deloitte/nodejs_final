const express = require('express');
const router = express.Router();
const organizerController = require('../controllers/organizerController');
const { authenticateOrganizer } = require('../middleware/authMiddleware'); // Import the organizer authentication middleware

// Route for creating a new organizer
router.post('/create', organizerController.createOrganizer);

// Organizer login route and generate JWT token
router.post('/login', organizerController.login);

// Route for getting all organizers
router.get('/', organizerController.getAllOrganizers);

// Route for updating organizer details (Protected route for organizer)
router.put('/:id', authenticateOrganizer, organizerController.updateOrganizer);

// Route for deleting an organizer (Protected route for organizer)
router.delete('/:id', authenticateOrganizer, organizerController.deleteOrganizer);

// Route for getting an organizer by ID
router.get('/:id', organizerController.getOrganizerById);

// Route for getting all hackathons hosted by an organizer (Protected route for organizer)
router.get('/:id/hackathons', authenticateOrganizer, organizerController.getHackathonsByOrganizer);

module.exports = router;
