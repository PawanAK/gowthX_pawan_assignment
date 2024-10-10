const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateToken } = require('../utils/jwt');
const Assignment = require('../models/assignment');
const mongoose = require('mongoose');

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

// Check if admin is authorized to modify an assignment
const checkAssignmentAuthorization = (assignment, userId) => {
  if (!assignment) {
    throw new Error('Assignment not found. Please check the assignment ID.');
  }
  if (assignment.admin.toString() !== userId) {
    throw new Error('Not authorized to modify this assignment. You can only modify assignments assigned to you.');
  }
  if (assignment.status !== 'pending') {
    throw new Error('Assignment is not in pending status. Only pending assignments can be modified.');
  }
};

// Controller functions

// Register a new admin user
const registerAdmin = async (req, res) => {
  console.log('Attempting to register admin:', req.body.username);
  try {
    const { username, password } = req.body;
    validateString(username, 3, 'Username');
    validateString(password, 6, 'Password');

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists. Please choose a different username.' });
    }

    // Create and save new admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({ username, password: hashedPassword, role: 'admin' });
    await admin.save();
    console.log('Admin registered successfully:', admin.username);
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    handleErrors(res, error, 'Error registering admin');
  }
};

// Authenticate and log in an admin user
const loginAdmin = async (req, res) => {
  console.log('Attempting to log in admin:', req.body.username);
  try {
    const { username, password } = req.body;
    validateString(username, 3, 'Username');
    validateString(password, 6, 'Password');

    // Find admin and check credentials
    const admin = await User.findOne({ username, role: 'admin' });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(400).json({ message: 'Invalid credentials. Please check your username and password.' });
    }

    // Generate and send token
    const token = generateToken(admin);
    console.log('Admin logged in successfully:', admin.username);
    res.json({ token, admin: { id: admin._id, username: admin.username, role: admin.role } });
  } catch (error) {
    handleErrors(res, error, 'Error logging in admin');
  }
};

// Retrieve all assignments for the logged-in admin
const getAssignments = async (req, res) => {
  console.log('Fetching assignments for admin:', req.user.username);
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized. Please log in to access assignments.' });
    }

    // Fetch and sort assignments
    const assignments = await Assignment.find({ admin: req.user.id }).sort({ createdAt: -1 });
    console.log(`${assignments.length} assignments fetched successfully`);
    res.json(assignments);
  } catch (error) {
    handleErrors(res, error, 'Error fetching assignments');
  }
};

// Update assignment status (accept or reject)
const updateAssignmentStatus = async (req, res, newStatus) => {
  console.log(`Attempting to ${newStatus} assignment:`, req.params.id);
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid assignment ID. Please provide a valid assignment ID.' });
    }

    // Find assignment and check authorization
    const assignment = await Assignment.findById(id);
    checkAssignmentAuthorization(assignment, req.user.id);

    // Update and save assignment status
    assignment.status = newStatus;
    await assignment.save();
    
    console.log(`Assignment ${newStatus} successfully:`, assignment._id);
    res.json({ message: `Assignment ${newStatus} successfully`, assignment });
  } catch (error) {
    handleErrors(res, error, `Error ${newStatus} assignment`);
  }
};

// Accept an assignment
const acceptAssignment = async (req, res) => updateAssignmentStatus(req, res, 'accepted');

// Reject an assignment
const rejectAssignment = async (req, res) => updateAssignmentStatus(req, res, 'rejected');

module.exports = {
  registerAdmin,
  loginAdmin,
  getAssignments,
  acceptAssignment,
  rejectAssignment
};