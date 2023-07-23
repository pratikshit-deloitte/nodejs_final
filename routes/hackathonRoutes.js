const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');

const { authenticateOrganizer } = require('../middleware/authMiddleware');

// Custom middleware to check if the authenticated user is an organizer
const authorizeOrganizer = (req, res, next) => {
  // Assuming you have a property `isOrganizer` in the JWT payload
  if (req.user.isOrganizer) {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized. Only organizers can perform this action.' });
  }
};

// Route for creating a new hackathon (Protected route for organizer)
router.post('/', authenticateOrganizer, hackathonController.createHackathon);

// Route for getting all hackathons
router.get('/', hackathonController.getAllHackathons);

// Route for getting a hackathon by ID
router.get('/:id', hackathonController.getHackathonById);

// Route for updating hackathon details (Protected route for organizer)
router.put('/:id', authenticateOrganizer, hackathonController.updateHackathon);

// Route for deleting a hackathon (Protected route for organizer)
router.delete('/:id', authenticateOrganizer, hackathonController.deleteHackathon);

// Route for getting all participants of a hackathon (Protected route for organizer)
router.get('/:id/participants', authenticateOrganizer, hackathonController.getParticipantsByHackathon);

// Route for filtering participants based on criteria (accessible only to organizers)
router.post('/filter-participants', authenticateOrganizer, hackathonController.filterParticipants);

router.get('/search', hackathonController.searchHackathons);

module.exports = router;
