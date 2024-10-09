const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Assignment Schema
const assignmentSchema = new Schema({
  userId: { type: String, required: true },
  task: { type: String, required: true },
  admin: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Create model
const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;