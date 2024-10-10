const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/user');
const Assignment = require('../models/assignment');
const { generateToken } = require('../utils/jwt');

// Utility functions

// Validate string input
const validateString = (value, minLength, fieldName) => {
  if (!value || typeof value !== 'string' || value.trim().length < minLength) {
    throw new Error(`Invalid ${fieldName}. ${fieldName} must be a string with at least ${minLength} characters.`);
  }
};

// Standardized error handling
const handleErrors = (res, error, customMessage) => {
  console.error(customMessage, error);
  res.status(500).json({ message: `${customMessage}. Please try again later.`, error: error.message });
};

// Controller functions

// Register a new user
const registerUser = async (req, res) => {
  console.log('Attempting to register user:', req.body.username);
  try {
    const { username, password, role } = req.body;

    // Validate input
    validateString(username, 3, 'Username');
    validateString(password, 6, 'Password');
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Role must be either "user" or "admin".' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists. Please choose a different username.' });
    }

    // Create and save new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();

    console.log('User registered successfully:', user.username);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    handleErrors(res, error, 'Error registering user');
  }
};

// Authenticate and log in a user
const loginUser = async (req, res) => {
  console.log('Attempting to log in user:', req.body.username);
  try {
    const { username, password } = req.body;

    // Validate input
    validateString(username, 1, 'Username');
    validateString(password, 1, 'Password');

    // Find user and check credentials
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials. Please check your username and password.' });
    }

    // Generate and send token
    const token = generateToken(user);
    console.log('User logged in successfully:', user.username);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    handleErrors(res, error, 'Error logging in user');
  }
};

// Fetch all admin users
const getAdmins = async (req, res) => {
  console.log('Fetching admins');
  try {
    const admins = await User.find({ role: 'admin' }, 'username');
    console.log('Admins fetched successfully');
    res.json(admins);
  } catch (error) {
    handleErrors(res, error, 'Error fetching admins');
  }
};

// Submit a new assignment
const submitAssignment = async (req, res) => {
  console.log('Attempting to submit assignment');
  try {
    const { task, adminId } = req.body;
    const userId = req.user.id;

    // Validate input
    validateString(task, 1, 'Task');
    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ message: 'Invalid adminId. Please provide a valid admin ID.' });
    }

    // Check if admin exists
    const adminExists = await User.exists({ _id: adminId, role: 'admin' });
    if (!adminExists) {
      return res.status(404).json({ message: 'Admin not found. Please provide a valid admin ID.' });
    }

    // Create and save new assignment
    const assignment = new Assignment({ userId, task, admin: adminId });
    await assignment.save();

    console.log('Assignment submitted successfully');
    res.status(201).json({ message: 'Assignment submitted successfully', assignment });
  } catch (error) {
    handleErrors(res, error, 'Error submitting assignment');
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAdmins,
  submitAssignment
};