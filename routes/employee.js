// routes/employee.js

const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const passport = require('passport');

// Employee Registration
router.post('/register', employeeController.registerEmployee);

// Employee Login
router.post('/login', employeeController.loginEmployee);

// Employee Participation in a Hackathon
router.post(
  '/participate/:employeeId/:hackathonId',
  passport.authenticate('jwt', { session: false }),
  employeeController.participateInHackathon
);

// Employee's Participated Hackathons
router.get('/participated/:employeeId', employeeController.listParticipatedHackathons);

module.exports = router;
