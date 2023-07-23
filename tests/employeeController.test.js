const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Employee = require('../models/employeeModel');
const jwt = require('jsonwebtoken');

// Test data
const testUser = {
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'testpassword',
};

// Helper function to create a new test user
const createTestUser = async () => {
  return await Employee.create(testUser);
};

// Helper function to get an auth token for a test user
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
  await Employee.deleteMany({});
  await mongoose.connection.close();
});

describe('Employee Controller', () => {
  // Test for employee registration API
  describe('POST /api/employees/register', () => {
    it('should register a new employee', async () => {
      const response = await request(app).post('/api/employees/register').send(testUser);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 400 if employee with the same email already exists', async () => {
      await createTestUser();
      const response = await request(app).post('/api/employees/register').send(testUser);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Employee with this email already exists.');
    });
  });

  // Test for employee login API
  describe('POST /api/employees/login', () => {
    it('should login an existing employee', async () => {
      await createTestUser();
      const response = await request(app).post('/api/employees/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 404 if employee with the provided email does not exist', async () => {
      const response = await request(app).post('/api/employees/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Employee not found');
    });

    it('should return 401 if employee provides invalid credentials', async () => {
      await createTestUser();
      const response = await request(app).post('/api/employees/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  // Test for employee participation in a hackathon API
  describe('POST /api/employees/:employeeId/participate/:hackathonId', () => {
    it('should allow an employee to participate in a hackathon', async () => {
      const employee = await createTestUser();
      const hackathonId = mongoose.Types.ObjectId();

      const authToken = getAuthToken(employee._id);

      const response = await request(app)
        .post(`/api/employees/${employee._id}/participate/${hackathonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Successfully registered for the hackathon');
    });

    it('should return 404 if employee is not found', async () => {
      const hackathonId = mongoose.Types.ObjectId();

      const authToken = getAuthToken(mongoose.Types.ObjectId());

      const response = await request(app)
        .post(`/api/employees/${mongoose.Types.ObjectId()}/participate/${hackathonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Employee not found');
    });

    it('should return 409 if employee is already registered for the hackathon', async () => {
      const employee = await createTestUser();
      const hackathonId = mongoose.Types.ObjectId();

      const authToken = getAuthToken(employee._id);

      // Simulate employee already registered for the hackathon
      employee.hackathons.push(hackathonId);
      await employee.save();

      const response = await request(app)
        .post(`/api/employees/${employee._id}/participate/${hackathonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'Employee is already registered for this hackathon');
    });

    it('should return 404 if hackathon is not found', async () => {
      const employee = await createTestUser();
      const hackathonId = mongoose.Types.ObjectId();

      const authToken = getAuthToken(employee._id);

      const response = await request(app)
        .post(`/api/employees/${employee._id}/participate/${hackathonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Hackathon not found');
    });

  });

  // Test for listing hackathons participated by an employee
  describe('GET /api/employees/:employeeId/hackathons', () => {
    it('should list all hackathons participated by an employee', async () => {
      const employee = await createTestUser();
      const hackathonId = mongoose.Types.ObjectId();

      const authToken = getAuthToken(employee._id);

      // Simulate employee participating in a hackathon
      employee.hackathons.push(hackathonId);
      await employee.save();

      const response = await request(app)
        .get(`/api/employees/${employee._id}/hackathons`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
    });

    it('should return 404 if employee is not found', async () => {
      const authToken = getAuthToken(mongoose.Types.ObjectId());

      const response = await request(app)
        .get(`/api/employees/${mongoose.Types.ObjectId()}/hackathons`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Employee not found');
    });

    
  });
});
