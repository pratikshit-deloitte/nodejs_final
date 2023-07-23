// tests/organizerController.test.js

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Organizer = require('../models/organizerModel');
const jwt = require('jsonwebtoken');

// Test data
const testOrganizer = {
  username: 'testorganizer',
  email: 'testorganizer@example.com',
  password: 'testpassword',
};

// Helper function to create a new test organizer
const createTestOrganizer = async () => {
  return await Organizer.create(testOrganizer);
};

// Helper function to get an auth token for a test organizer
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
  await Organizer.deleteMany({});
  await mongoose.connection.close();
});

describe('Organizer Controller', () => {
  // Test for organizer registration API
  describe('POST /api/organizers/register', () => {
    it('should register a new organizer', async () => {
      const response = await request(app).post('/api/organizers/register').send(testOrganizer);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 400 if organizer with the same email already exists', async () => {
      await createTestOrganizer();
      const response = await request(app).post('/api/organizers/register').send(testOrganizer);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Organizer with this email already exists.');
    });
  });

  // Test for organizer login API
  describe('POST /api/organizers/login', () => {
    it('should login an existing organizer', async () => {
      await createTestOrganizer();
      const response = await request(app).post('/api/organizers/login').send({
        email: testOrganizer.email,
        password: testOrganizer.password,
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 404 if organizer with the provided email does not exist', async () => {
      const response = await request(app).post('/api/organizers/login').send({
        email: testOrganizer.email,
        password: testOrganizer.password,
      });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Organizer not found');
    });

    it('should return 401 if organizer provides invalid credentials', async () => {
      await createTestOrganizer();
      const response = await request(app).post('/api/organizers/login').send({
        email: testOrganizer.email,
        password: 'wrongpassword',
      });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  // Test for host a hackathon API
  describe('POST /api/organizers/:organizerId/host-hackathon', () => {
    it('should allow an organizer to host a hackathon', async () => {
      const organizer = await createTestOrganizer();
      const authToken = getAuthToken(organizer._id);

      const newHackathon = {
        name: 'Test Hackathon',
        technologyStack: 'Node.js, React',
        startDate: new Date(),
        endDate: new Date(),
        slots: 50,
        minimumRequirements: 'Basic knowledge of Node.js and React',
      };

      const response = await request(app)
        .post(`/api/organizers/${organizer._id}/host-hackathon`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(newHackathon);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', newHackathon.name);
    });

    it('should return 404 if organizer is not found', async () => {
      const authToken = getAuthToken(mongoose.Types.ObjectId());

      const newHackathon = {
        name: 'Test Hackathon',
        technologyStack: 'Node.js, React',
        startDate: new Date(),
        endDate: new Date(),
        slots: 50,
        minimumRequirements: 'Basic knowledge of Node.js and React',
      };

      const response = await request(app)
        .post(`/api/organizers/${mongoose.Types.ObjectId()}/host-hackathon`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(newHackathon);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Organizer not found');
    });

    // Add more test cases for other conditions and validation checks if needed
  });

  // Add test cases for other APIs in the organizerController

  // Test for updating a hackathon API
  describe('PATCH /api/organizers/:organizerId/update-hackathon/:hackathonId', () => {
    it('should allow an organizer to update a hackathon', async () => {
      const organizer = await createTestOrganizer();
      const authToken = getAuthToken(organizer._id);

      const hackathonToUpdate = {
        name: 'Updated Hackathon Name',
        slots: 100,
        minimumRequirements: 'Advanced knowledge of Node.js and React',
      };

      const newHackathon = {
        name: 'Test Hackathon',
        technologyStack: 'Node.js, React',
        startDate: new Date(),
        endDate: new Date(),
        slots: 50,
        minimumRequirements: 'Basic knowledge of Node.js and React',
      };

      // Host a new hackathon first
      const hostResponse = await request(app)
        .post(`/api/organizers/${organizer._id}/host-hackathon`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(newHackathon);

      const response = await request(app)
        .patch(`/api/organizers/${organizer._id}/update-hackathon/${hostResponse.body._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(hackathonToUpdate);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', hostResponse.body._id);
      expect(response.body).toHaveProperty('name', hackathonToUpdate.name);
      expect(response.body).toHaveProperty('slots', hackathonToUpdate.slots);
      expect(response.body).toHaveProperty('minimumRequirements', hackathonToUpdate.minimumRequirements);
    });

    it('should return 404 if organizer is not found', async () => {
      const authToken = getAuthToken(mongoose.Types.ObjectId());

      const hackathonToUpdate = {
        name: 'Updated Hackathon Name',
        slots: 100,
        minimumRequirements: 'Advanced knowledge of Node.js and React',
      };

      const response = await request(app)
        .patch(`/api/organizers/${mongoose.Types.ObjectId()}/update-hackathon/${mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(hackathonToUpdate);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Organizer not found');
    });

    it('should return 404 if hackathon is not found', async () => {
      const organizer = await createTestOrganizer();
      const authToken = getAuthToken(organizer._id);

      const hackathonToUpdate = {
        name: 'Updated Hackathon Name',
        slots: 100,
        minimumRequirements: 'Advanced knowledge of Node.js and React',
      };

      const response = await request(app)
        .patch(`/api/organizers/${organizer._id}/update-hackathon/${mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(hackathonToUpdate);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Hackathon not found');
    });

    // Add more test cases for other conditions and validation checks if needed
  });

  // Test for deleting a hackathon API
  describe('DELETE /api/organizers/:organizerId/delete-hackathon/:hackathonId', () => {
    it('should allow an organizer to delete a hackathon', async () => {
      const organizer = await createTestOrganizer();
      const authToken = getAuthToken(organizer._id);

      const newHackathon = {
        name: 'Test Hackathon',
        technologyStack: 'Node.js, React',
        startDate: new Date(),
        endDate: new Date(),
        slots: 50,
        minimumRequirements: 'Basic knowledge of Node.js and React',
      };

      // Host a new hackathon first
      const hostResponse = await request(app)
        .post(`/api/organizers/${organizer._id}/host-hackathon`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(newHackathon);

      const response = await request(app)
        .delete(`/api/organizers/${organizer._id}/delete-hackathon/${hostResponse.body._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', hostResponse.body._id);
      expect(response.body).toHaveProperty('name', newHackathon.name);
    });

    it('should return 404 if organizer is not found', async () => {
      const authToken = getAuthToken(mongoose.Types.ObjectId());

      const response = await request(app)
        .delete(`/api/organizers/${mongoose.Types.ObjectId()}/delete-hackathon/${mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Organizer not found');
    });

    it('should return 404 if hackathon is not found', async () => {
      const organizer = await createTestOrganizer();
      const authToken = getAuthToken(organizer._id);

      const response = await request(app)
        .delete(`/api/organizers/${organizer._id}/delete-hackathon/${mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Hackathon not found');
    });

    // Add more test cases for other conditions and validation checks if needed
  });

  // Test for listing all hackathons hosted by an organizer API
  describe('GET /api/organizers/:organizerId/hosted-hackathons', () => {
    it('should list all hackathons hosted by an organizer', async () => {
      const organizer = await createTestOrganizer();
      const authToken = getAuthToken(organizer._id);

      const hackathon1 = {
        name: 'Hackathon 1',
        technologyStack: 'Node.js, React',
        startDate: new Date(),
        endDate: new Date(),
        slots: 50,
        minimumRequirements: 'Basic knowledge of Node.js and React',
      };

      const hackathon2 = {
        name: 'Hackathon 2',
        technologyStack: 'Python, Django',
        startDate: new Date(),
        endDate: new Date(),
        slots: 30,
        minimumRequirements: 'Basic knowledge of Python and Django',
      };

      // Host two hackathons
      await request(app).post(`/api/organizers/${organizer._id}/host-hackathon`).set('Authorization', `Bearer ${authToken}`).send(hackathon1);
      await request(app).post(`/api/organizers/${organizer._id}/host-hackathon`).set('Authorization', `Bearer ${authToken}`).send(hackathon2);

      const response = await request(app)
        .get(`/api/organizers/${organizer._id}/hosted-hackathons`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
    });

    it('should return 404 if organizer is not found', async () => {
      const authToken = getAuthToken(mongoose.Types.ObjectId());

      const response = await request(app)
        .get(`/api/organizers/${mongoose.Types.ObjectId()}/hosted-hackathons`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Organizer not found');
    });

    // Add more test cases for other scenarios if needed
  });
});
