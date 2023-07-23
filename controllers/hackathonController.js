// controllers/hackathonController.js

const Hackathon = require('../models/hackathonModel');
const Employee = require('../models/employeeModel');

// API to list all Active/Past/Upcoming Hackathons with pagination
const listHackathons = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const currentDate = new Date();

  try {
    // Count total hackathons for pagination
    const totalCount = await Hackathon.countDocuments({ endDate: { $gte: currentDate } });

    // Fetch hackathons with pagination
    const hackathons = await Hackathon.find({ endDate: { $gte: currentDate } })
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('organizer', 'username email');

    return res.status(200).json({ totalCount, hackathons });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// API to search Hackathons by Name, Company, Technology Stack
const searchHackathons = async (req, res) => {
  const { searchQuery } = req.query;

  try {
    const hackathons = await Hackathon.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { 'organizer.username': { $regex: searchQuery, $options: 'i' } },
        { technologyStack: { $regex: searchQuery, $options: 'i' } },
      ],
    });

    return res.status(200).json(hackathons);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// API to get Hackathon details by ID
const getHackathonById = async (req, res) => {
  const { hackathonId } = req.params;

  try {
    const hackathon = await Hackathon.findById(hackathonId).populate('organizer', 'username email');
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    return res.status(200).json(hackathon);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// API to list all hackathons participated by an employee
const listParticipatedHackathons = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const employee = await Employee.findById(employeeId).populate('hackathons');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.status(200).json(employee.hackathons);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  listHackathons,
  searchHackathons,
  getHackathonById,
  listParticipatedHackathons,
};
