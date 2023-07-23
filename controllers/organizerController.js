const Organizer = require('../models/organizerModel');
const Hackathon = require('../models/hackathonModel');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

// Create a new organizer
exports.createOrganizer = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const organizer = new Organizer({ name, email, password });
    await organizer.save();
    res.status(201).json({ message: 'Organizer created successfully!', organizer });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create organizer.', details: err.message });
  }
};

// Organizer login and generate JWT token
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const organizer = await Organizer.findOne({ email });

    if (!organizer || organizer.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: organizer._id, email: organizer.email }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful!', token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log in.', details: err.message });
  }
};

// Get all organizers
exports.getAllOrganizers = async (req, res) => {
  try {
    const organizers = await Organizer.find();
    res.status(200).json(organizers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch organizers.', details: err.message });
  }
};

// Get an organizer by ID
exports.getOrganizerById = async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.params.id);
    if (!organizer) {
      return res.status(404).json({ error: 'Organizer not found.' });
    }
    res.status(200).json(organizer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch organizer.', details: err.message });
  }
};

// Update organizer details
exports.updateOrganizer = async (req, res) => {
  try {
    const { name, email } = req.body;
    const organizerId = req.params.id;
    const organizer = await Organizer.findByIdAndUpdate(organizerId, { name, email }, { new: true });
    if (!organizer) {
      return res.status(404).json({ error: 'Organizer not found.' });
    }
    res.status(200).json({ message: 'Organizer details updated successfully!', organizer });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update organizer details.', details: err.message });
  }
};

// Delete an organizer
exports.deleteOrganizer = async (req, res) => {
  try {
    const organizerId = req.params.id;
    const organizer = await Organizer.findByIdAndDelete(organizerId);
    if (!organizer) {
      return res.status(404).json({ error: 'Organizer not found.' });
    }
    res.status(200).json({ message: 'Organizer deleted successfully!', organizer });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete organizer.', details: err.message });
  }
};

// Get all hackathons hosted by an organizer
exports.getHackathonsByOrganizer = async (req, res) => {
  try {
    const organizerId = req.params.id;
    const hackathons = await Hackathon.find({ organizer: organizerId });
    res.status(200).json(hackathons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hackathons.', details: err.message });
  }
};
