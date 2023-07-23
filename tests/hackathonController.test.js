// tests/hackathonController.test.js

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Hackathon = require('../models/hackathonModel');
const Employee = require('../models/employeeModel');
const jwt = require('jsonwebtoken');

// Test data
const testEmployee = {
  username: 'testemployee',
  email: 'testemployee@example.com',
  password: 'testpassword',
};

const testHackathon = {
  name: 'Test Hackathon',
  technologyStack: 'Node.js, React',
  startDate: new Date(),
  endDate: new Date(),
  slots: 50,
  minimumRequirements: 'Basic knowledge of Node.js and React',
};

// Helper function to create a new test employee
const createTestEmployee = async () => {
  return await Employee.create(testEmployee);
};

// Helper function to create a new test hackathon
const createTestHackathon = async () => {
  return await Hackathon.create(testHackathon);
};

// Helper function to get an auth token for a test employee
const getAuthToken = (userId) => {
  return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '1h' });
};

// Run before all test cases in this file
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
});

// Run after all test cases in this file
afterAll(async () => {
  await Hackathon.deleteMany({});
  await Employee.deleteMany({});
  await mongoose.connection.close();
});

describe('Hackathon Controller', () => {
  // Test for listing all active/past/upcoming hackathons API
  describe('GET /api/hackathons', () => {
    it('should list all hackathons', async () => {
      await createTestHackathon();
      const response = await request(app).get('/api/hackathons');
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
    });

    // Add more test cases for different scenarios if needed
  });

  // Test for searching hackathons by name, company, and technology stack API
  describe('GET /api/hackathons/search', () => {
    it('should search hackathons by name', async () => {
      await createTestHackathon();
      const response = await request(app).get(`/api/hackathons/search?name=${testHackathon.name}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
    });

    it('should search hackathons by technology stack', async () => {
      await createTestHackathon();
      const response = await request(app).get(`/api/hackathons/search?technologyStack=${testHackathon.technologyStack}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
    });

    it('should return 404 if hackathons not found for a given search query', async () => {
      const response = await request(app).get('/api/hackathons/search?name=InvalidHackathonName');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'No hackathons found for the given search query');
    });

    // Add more test cases for different search scenarios if needed
  });

  // Test for listing all participants of a hackathon API
  describe('GET /api/hackathons/:hackathonId/participants', () => {
    it('should list all participants of a hackathon', async () => {
      const employee = await createTestEmployee();
      const hackathon = await createTestHackathon();

      hackathon.participants.push(employee._id);
      await hackathon.save();

      const response = await request(app).get(`/api/hackathons/${hackathon._id}/participants`);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
    });

    it('should return 404 if hackathon is not found', async () => {
      const response = await request(app).get(`/api/hackathons/${mongoose.Types.ObjectId()}/participants`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Hackathon not found');
    });

    // Add more test cases for different scenarios if needed
  });

  // Test for filtering hackathon participants by experience level, technology stack, and business unit API
  describe('GET /api/hackathons/:hackathonId/participants/filter', () => {
    it('should filter hackathon participants by experience level', async () => {
      const employee1 = await createTestEmployee();
      const employee2 = await createTestEmployee();
      const hackathon = await createTestHackathon();

      employee1.experienceLevel = 'Intermediate';
      employee2.experienceLevel = 'Advanced';
      await employee1.save();
      await employee2.save();

      hackathon.participants.push(employee1._id, employee2._id);
      await hackathon.save();

      const response = await request(app).get(`/api/hackathons/${hackathon._id}/participants/filter?experienceLevel=Intermediate`);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
    });

    it('should filter hackathon participants by technology stack', async () => {
      const employee1 = await createTestEmployee();
      const employee2 = await createTestEmployee();
      const hackathon = await createTestHackathon();

      employee1.technologyStack = 'Node.js, React';
      employee2.technologyStack = 'Python, Django';
      await employee1.save();
      await employee2.save();

      hackathon.participants.push(employee1._id, employee2._id);
      await hackathon.save();

      const response = await request(app).get(`/api/hackathons/${hackathon._id}/participants/filter?technologyStack=Node.js,%20React`);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
    });

    it('should filter hackathon participants by business unit', async () => {
      const employee1 = await createTestEmployee();
      const employee2 = await createTestEmployee();
      const hackathon = await createTestHackathon();

      employee1.businessUnit = 'Marketing';
      employee2.businessUnit = 'Engineering';
      await employee1.save();
      await employee2.save();

      hackathon.participants.push(employee1._id, employee2._id);
      await hackathon.save();

      const response = await request(app).get(`/api/hackathons/${hackathon._id}/participants/filter?businessUnit=Marketing`);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
    });

    it('should return 404 if hackathon is not found', async () => {
      const response = await request(app).get(`/api/hackathons/${mongoose.Types.ObjectId()}/participants/filter?experienceLevel=Intermediate`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Hackathon not found');
    });

    // Add more test cases for different scenarios if needed
  });

  // Test for listing all hackathons participated by an employee API
  describe('GET /api/employees/:employeeId/participated-hackathons', () => {
    it('should list all hackathons participated by an employee', async () => {
      const employee = await createTestEmployee();
      const hackathon = await createTestHackathon();

      employee.hackathons.push(hackathon._id);
      await employee.save();

      const response = await request(app).get(`/api/employees/${employee._id}/participated-hackathons`);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
    });

    it('should return 404 if employee is not found', async () => {
      const response = await request(app).get(`/api/employees/${mongoose.Types.ObjectId()}/participated-hackathons`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Employee not found');
    });

    // Add more test cases for different scenarios if needed
  });

  // Add more test cases for other APIs in the hackathonController

  // Test for checking hackathon status API
  describe('GET /api/hackathons/:hackathonId/status', () => {
    it('should return the status of the hackathon', async () => {
      const hackathon = await createTestHackathon();

      const response = await request(app).get(`/api/hackathons/${hackathon._id}/status`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isOpenForRegistration');
    });

    it('should return 404 if hackathon is not found', async () => {
      const response = await request(app).get(`/api/hackathons/${mongoose.Types.ObjectId()}/status`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Hackathon not found');
    });

    // Add more test cases for different scenarios if needed
  });
});
