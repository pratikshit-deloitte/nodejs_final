const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDate: { type: Date, required: true },
  slots: { type: Number, required: true },
  technologyStack: { type: String, required: true },
  businessUnits: { type: [String], required: true },
  minimumRequirements: {
    experienceLevel: { type: String, required: true },
    technologyStack: { type: String, required: true },
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organizer",
    required: true,
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
  status: { type: String, enum: ["Open", "Closed"], default: "Open" },
});

const Hackathon = mongoose.model("Hackathon", hackathonSchema);

module.exports = Hackathon;