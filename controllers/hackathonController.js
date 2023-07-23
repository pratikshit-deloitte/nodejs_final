const Hackathon = require("../models/hackathonModel");
const { isValidObjectId } = require("mongoose");

// Create a new hackathon
exports.createHackathon = async (req, res) => {
  try {
    const { name, description, startDate, endDate, slots, minimumRequirements } = req.body;

    // Verify the organizer token
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

      // Create the hackathon
      const hackathon = new Hackathon({
        name,
        description,
        startDate,
        endDate,
        slots,
        minimumRequirements,
        organizer: organizerId,
      });

      await hackathon.save();
      res.status(201).json({ message: 'Hackathon created successfully!', hackathon });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create hackathon.', details: err.message });
  }
};

// Get all hackathons with pagination
exports.getAllHackathons = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const hackathons = await Hackathon.paginate({}, options);

    res.status(200).json(hackathons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hackathons.', details: err.message });
  }
};

// Get a hackathon by ID
exports.getHackathonById = async (req, res) => {
  try {
    const hackathonId = req.params.id;

    if (!isValidObjectId(hackathonId)) {
      return res.status(400).json({ error: "Invalid hackathon ID." });
    }

    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      return res.status(404).json({ error: "Hackathon not found." });
    }

    res.status(200).json(hackathon);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch hackathon.", details: err.message });
  }
};

// Update a hackathon
exports.updateHackathon = async (req, res) => {
  try {
    const hackathonId = req.params.id;

    if (!isValidObjectId(hackathonId)) {
      return res.status(400).json({ error: "Invalid hackathon ID." });
    }

    // Check if the user is an authorized organizer
    if (!req.user.isOrganizer) {
      return res
        .status(403)
        .json({
          error: "Unauthorized. Only organizers can update a hackathon.",
        });
    }

    const hackathon = await Hackathon.findByIdAndUpdate(hackathonId, req.body, {
      new: true,
    });

    if (!hackathon) {
      return res.status(404).json({ error: "Hackathon not found." });
    }

    res
      .status(200)
      .json({ message: "Hackathon updated successfully!", hackathon });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update hackathon.", details: err.message });
  }
};

// Delete a hackathon
exports.deleteHackathon = async (req, res) => {
  try {
    const hackathonId = req.params.id;

    if (!isValidObjectId(hackathonId)) {
      return res.status(400).json({ error: "Invalid hackathon ID." });
    }

    // Check if the user is an authorized organizer
    if (!req.user.isOrganizer) {
      return res
        .status(403)
        .json({
          error: "Unauthorized. Only organizers can delete a hackathon.",
        });
    }

    const hackathon = await Hackathon.findByIdAndDelete(hackathonId);

    if (!hackathon) {
      return res.status(404).json({ error: "Hackathon not found." });
    }

    res
      .status(200)
      .json({ message: "Hackathon deleted successfully!", hackathon });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete hackathon.", details: err.message });
  }
};

// Get all participants of a hackathon
exports.getParticipantsByHackathon = async (req, res) => {
  try {
    const hackathonId = req.params.id;

    if (!isValidObjectId(hackathonId)) {
      return res.status(400).json({ error: 'Invalid hackathon ID.' });
    }

    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found.' });
    }

    // Check if the user is an authorized organizer
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Unauthorized. Only organizers can view participants.' });
    }

    const participants = await Employee.find({ _id: { $in: hackathon.participants } }, '-password');

    res.status(200).json(participants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch participants.', details: err.message });
  }
};

// Filter participants based on criteria (accessible only to organizers)
exports.filterParticipants = async (req, res) => {
  try {
    // Check if the user is an authorized organizer
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Unauthorized. Only organizers can filter participants.' });
    }

    const { experienceLevel, technologyStack, businessUnit } = req.body;

    const filter = {};

    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    if (technologyStack) {
      filter.technologyStack = technologyStack;
    }

    if (businessUnit) {
      filter.businessUnit = businessUnit;
    }

    const participants = await Employee.find(filter, '-password');

    res.status(200).json(participants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to filter participants.', details: err.message });
  }
};

exports.searchHackathons = async (req, res) => {
  try {
    const { name, companyName, technologyStack } = req.query;

    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }

    if (companyName) {
      filter.companyName = { $regex: companyName, $options: 'i' }; // Case-insensitive search
    }

    if (technologyStack) {
      filter.technologyStack = { $regex: technologyStack, $options: 'i' }; // Case-insensitive search
    }

    const hackathons = await Hackathon.find(filter);

    res.status(200).json(hackathons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search hackathons.', details: err.message });
  }
};
