const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

// Import route handlers
const organizerRoutes = require('./routes/organizerRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');

// Import auth middleware
const { authenticateUser } = require('./middleware/authMiddleware');

// Set up Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

// Connect to MongoDB
const { MONGODB_URI } = require('./config'); // Import MongoDB connection URI from config.js
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/organizers', organizerRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/hackathons', hackathonRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to Hash-A-Thon application.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
