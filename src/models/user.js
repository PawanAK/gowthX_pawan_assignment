const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema (encompasses both regular users and admins)
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

// Create model
const User = mongoose.model('User', userSchema);

module.exports = User;