const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: String,
  position: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  salary: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
    required: true,
  },
  linkedin: String,
  portfolio: String,
  source: String,
  resumeFileName: String,
  coverLetter: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["new", "reviewing", "shortlisted", "rejected", "hired"],
    default: "new",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Application", applicationSchema);
