// models/organizerModel.js

const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isOrganizer: { type: Boolean, default: true },
});

const Organizer = mongoose.model('Organizer', organizerSchema);

module.exports = Organizer;
