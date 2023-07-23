const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Define the Hackathon schema
const hackathonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  technologyStack: {
    type: [String],
    required: true,
  },
  registrationOpen: {
    type: Boolean,
    default: true,
  },
  registrationDate: {
    type: Date,
    required: true,
  },
  maxParticipants: {
    type: Number,
    required: true,
  },
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Employee',
    default: [],
  },
  status: {
    type: String,
    enum: ['Active', 'Past', 'Upcoming'],
    default: 'Active',
  },
});

// Apply the pagination plugin to the schema
hackathonSchema.plugin(mongoosePaginate);

// Create the Hackathon model
const Hackathon = mongoose.model('Hackathon', hackathonSchema);

module.exports = Hackathon;
