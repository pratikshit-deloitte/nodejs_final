const { Employee, Organizer } = require('../models/employeeModel');
const Hackathon = require('../models/hackathonModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// API to register a new employee
const registerEmployee = async (req, res) => {
  const { username, password, email, experienceLevel, technologyStack, businessUnit } = req.body;
  try {
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee with this email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await Employee.create({
      username,
      email,
      password: hashedPassword,
      experienceLevel,
      technologyStack,
      businessUnit,
    });
    const token = jwt.sign({ userId: employee._id, isOrganizer: false }, process.env.SECRET_KEY, { expiresIn: '1h' });
    return res.status(201).json({ token });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// API for employee login
const loginEmployee = async (req, res) => {
  const { email, password } = req.body;
  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    const isPasswordCorrect = await bcrypt.compare(password, employee.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: employee._id, isOrganizer: false }, process.env.SECRET_KEY, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// API to register a new organizer
const registerOrganizer = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const existingOrganizer = await Organizer.findOne({ email });
    if (existingOrganizer) {
      return res.status(400).json({ message: 'Organizer with this email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const organizer = await Organizer.create({ username, email, password: hashedPassword });
    const token = jwt.sign({ userId: organizer._id, isOrganizer: true }, process.env.SECRET_KEY, { expiresIn: '1h' });
    return res.status(201).json({ token });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// API for organizer login
const loginOrganizer = async (req, res) => {
  const { email, password } = req.body;
  try {
    const organizer = await Organizer.findOne({ email });
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }
    const isPasswordCorrect = await bcrypt.compare(password, organizer.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: organizer._id, isOrganizer: true }, process.env.SECRET_KEY, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// API to allow employee participation in a hackathon
const participateInHackathon = async (req, res) => {
  const { employeeId, hackathonId } = req.params;
  try {
    // Verify the JWT token and get the authenticated user (employee)
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the user is authorized to participate in hackathons (employee role)
    if (!user.isOrganizer) {
      return res.status(403).json({ message: 'Unauthorized. Only employees can participate in hackathons.' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    if (employee.hackathons.includes(hackathonId)) {
      return res.status(409).json({ message: 'Employee is already registered for this hackathon' });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    // Check if the hackathon slots are full
    if (hackathon.participants.length >= hackathon.slots) {
      return res.status(400).json({ message: 'Hackathon slots are full' });
    }

    // Check if the registration date has passed
    if (new Date() > hackathon.registrationDate) {
      return res.status(400).json({ message: 'Registration date has passed' });
    }

    // Check if the employee satisfies the minimum requirements
    if (!employeeMeetsRequirements(employee, hackathon.minimumRequirements)) {
      return res.status(400).json({ message: 'Employee does not meet the minimum requirements' });
    }

    employee.hackathons.push(hackathonId);
    await employee.save();
    return res.status(200).json({ message: 'Successfully registered for the hackathon' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// API to list all hackathons participated by an employee
const listParticipatedHackathons = async (req, res) => {
  const { employeeId } = req.params;
  try {
    // Verify the JWT token and get the authenticated user (employee)
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the user is authorized to view participated hackathons (employee role)
    if (!user.isOrganizer && user.userId !== employeeId) {
      return res.status(403).json({ message: 'Unauthorized. You can only view your own participated hackathons.' });
    }

    const employee = await Employee.findById(employeeId).populate('hackathons');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    return res.status(200).json(employee.hackathons);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function to check if the employee meets the minimum requirements of the hackathon
const employeeMeetsRequirements = (employee, minimumRequirements) => {
  // Implement your logic to check if the employee meets the minimum requirements
  // Example: Check if the employee's experience level and technology stack match the hackathon's requirements

  const employeeExperienceLevel = employee.experienceLevel;
  const employeeTechnologyStack = employee.technologyStack;

  const hackathonExperienceLevelRequired = minimumRequirements.experienceLevel;
  const hackathonTechnologyStackRequired = minimumRequirements.technologyStack;

  // Check if the employee's experience level is greater than or equal to the required level
  if (employeeExperienceLevel !== hackathonExperienceLevelRequired) {
    return false;
  }

  // Check if the employee's technology stack matches the required stack
  if (!employeeTechnologyStack.includes(hackathonTechnologyStackRequired)) {
    return false;
  }

  // If the employee meets all the requirements, return true
  return true;
};

module.exports = {
  registerEmployee,
  loginEmployee,
  registerOrganizer,
  loginOrganizer,
  participateInHackathon,
  listParticipatedHackathons,
  employeeMeetsRequirements
};


// 3 5 API to allow employee participation in a hackathon
// const participateInHackathon = async (req, res) => {
//     const { employeeId, hackathonId } = req.params;
//     try {
//       const employee = await Employee.findById(employeeId);
//       if (!employee) {
//         return res.status(404).json({ message: 'Employee not found' });
//       }
//       if (employee.hackathons.includes(hackathonId)) {
//         return res.status(409).json({ message: 'Employee is already registered for this hackathon' });
//       }
  
//       const hackathon = await Hackathon.findById(hackathonId);
//       if (!hackathon) {
//         return res.status(404).json({ message: 'Hackathon not found' });
//       }
  
//       // Check if the hackathon slots are full
//       if (hackathon.participants.length >= hackathon.slots) {
//         return res.status(400).json({ message: 'Hackathon slots are full' });
//       }
  
//       // Check if the registration date has passed
//       if (new Date() > hackathon.registrationDate) {
//         return res.status(400).json({ message: 'Registration date has passed' });
//       }
  
//       // Check if the employee satisfies the minimum requirements set by the organizer
//       if (
//         hackathon.minimumRequirements &&
//         (!employee.experienceLevel ||
//           !employee.technologyStack ||
//           !employee.businessUnit ||
//           employee.experienceLevel < hackathon.minimumRequirements.experienceLevel ||
//           !hackathon.technologyStack.includes(employee.technologyStack) ||
//           !hackathon.businessUnits.includes(employee.businessUnit))
//       ) {
//         return res.status(403).json({ message: 'Employee does not satisfy minimum requirements' });
//       }
  
//       employee.hackathons.push(hackathonId);
//       await employee.save();
//       return res.status(200).json({ message: 'Successfully registered for the hackathon' });
//     } catch (error) {
//       return res.status(500).json({ message: 'Internal server error' });
//     }
//   };