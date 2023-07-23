const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const Organizer = require('../models/organizerModel');


// Middleware function to verify JWT and authenticate user
exports.authenticateUser = (req, res, next) => {
  try {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ error: 'Authorization token not found.' });
    }

    jwt.verify(token.replace('Bearer ', ''), SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid authorization token.' });
      }

      // Attach the decoded user information to the request object for future use
      req.user = decoded;
      next();
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to authenticate user.', details: err.message });
  }
};

// Middleware function to verify JWT and authenticate organizer
exports.authenticateOrganizer = async (req, res, next) => {
  try {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ error: 'Authorization token not found.' });
    }

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid authorization token.' });
      }

      const organizerId = decoded.id;
      const organizer = await Organizer.findById(organizerId);
      if (!organizer) {
        return res.status(404).json({ error: 'Organizer not found.' });
      }

      // Attach the decoded organizer information to the request object for future use
      req.organizer = organizer;
      next();
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to authenticate organizer.', details: err.message });
  }
};
