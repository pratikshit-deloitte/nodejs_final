// controllers/organizerController.js

const Organizer = require('../models/organizerModel');
const Hackathon = require('../models/hackathonModel');

// API to host a new Hackathon
const hostHackathon = async (req, res) => {
  const { name, description, startDate, endDate, registrationDate, slots, technologyStack, businessUnits, minimumRequirements } = req.body;
  const organizerId = req.user.userId; // Organizer's user ID extracted from the JWT token

  try {
    // Check if the organizer exists
    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    // Create a new Hackathon
    const hackathon = await Hackathon.create({
      name,
      description,
      startDate,
      endDate,
      registrationDate,
      slots,
      technologyStack,
      businessUnits,
      minimumRequirements,
      organizer: organizerId,
    });

    return res.status(201).json({ message: 'Hackathon hosted successfully', hackathon });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// API to update an existing Hackathon
const updateHackathon = async (req, res) => {
  const { hackathonId } = req.params;
  const organizerId = req.user.userId; // Organizer's user ID extracted from the JWT token
  const updateData = req.body;

  try {
    // Check if the organizer exists
    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    // Find the Hackathon by ID and verify if it's hosted by the organizer
    const hackathon = await Hackathon.findOne({ _id: hackathonId, organizer: organizerId });
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found or you are not the organizer' });
    }

    // Update the Hackathon with the provided data
    await Hackathon.updateOne({ _id: hackathonId }, updateData);

    return res.status(200).json({ message: 'Hackathon updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// API to delete a Hackathon
const deleteHackathon = async (req, res) => {
  const { hackathonId } = req.params;
  const organizerId = req.user.userId; // Organizer's user ID extracted from the JWT token

  try {
    // Check if the organizer exists
    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    // Find the Hackathon by ID and verify if it's hosted by the organizer
    const hackathon = await Hackathon.findOne({ _id: hackathonId, organizer: organizerId });
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found or you are not the organizer' });
    }

    // Delete the Hackathon
    await Hackathon.deleteOne({ _id: hackathonId });

    return res.status(200).json({ message: 'Hackathon deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// API to list all hosted Hackathons by the Organizer
const listHostedHackathons = async (req, res) => {
  const organizerId = req.user.userId; // Organizer's user ID extracted from the JWT token

  try {
    // Check if the organizer exists
    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    // Find all Hackathons hosted by the organizer
    const hostedHackathons = await Hackathon.find({ organizer: organizerId });

    return res.status(200).json(hostedHackathons);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// API to list all participants of a Hackathon hosted by the Organizer
const listParticipants = async (req, res) => {
  const { hackathonId } = req.params;
  const organizerId = req.user.userId; // Organizer's user ID extracted from the JWT token

  try {
    // Check if the organizer exists
    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    // Find the Hackathon by ID and verify if it's hosted by the organizer
    const hackathon = await Hackathon.findOne({ _id: hackathonId, organizer: organizerId }).populate('participants');
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found or you are not the organizer' });
    }

    return res.status(200).json(hackathon.participants);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  hostHackathon,
  updateHackathon,
  deleteHackathon,
  listHostedHackathons,
  listParticipants,
};
