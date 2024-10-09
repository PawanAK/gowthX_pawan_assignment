const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateToken } = require('../utils/jwt');
const Assignment = require('../models/assignment');
const mongoose = require('mongoose');

const registerAdmin = async (req, res) => {
  console.log('Attempting to register admin:', req.body.username);
  try {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ message: 'Invalid username. Username must be a string with at least 3 characters.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Invalid password. Password must be a string with at least 6 characters.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists. Please choose a different username.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({ username, password: hashedPassword, role: 'admin' });
    await admin.save();
    console.log('Admin registered successfully:', admin.username);
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'An error occurred while registering the admin. Please try again later.', error: error.message });
  }
};

const loginAdmin = async (req, res) => {
  console.log('Attempting to log in admin:', req.body.username);
  try {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ message: 'Invalid username. Username must be a non-empty string.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid password. Password must be a non-empty string.' });
    }

    const admin = await User.findOne({ username, role: 'admin' });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials. Please check your username and password.' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Please check your username and password.' });
    }
    const token = generateToken(admin);
    console.log('Admin logged in successfully:', admin.username);
    res.json({ token, admin: { id: admin._id, username: admin.username, role: admin.role } });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ message: 'An error occurred while logging in. Please try again later.', error: error.message });
  }
};

const getAssignments = async (req, res) => {
  console.log('Fetching assignments for admin:', req.user.username);
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized. Please log in to access assignments.' });
    }

    const assignments = await Assignment.find({ admin: req.user.id })
      .sort({ createdAt: -1 });
    
    console.log(`${assignments.length} assignments fetched successfully`);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

const acceptAssignment = async (req, res) => {
  console.log('Attempting to accept assignment:', req.params.id);
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid assignment ID. Please provide a valid assignment ID.' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found. Please check the assignment ID.' });
    }

    if (!req.user || assignment.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to accept this assignment. You can only accept assignments assigned to you.' });
    }

    if (assignment.status !== 'pending') {
      return res.status(400).json({ message: 'Assignment is not in pending status. Only pending assignments can be accepted.' });
    }

    assignment.status = 'accepted';
    await assignment.save();
    
    console.log('Assignment accepted successfully:', assignment._id);
    res.json({ message: 'Assignment accepted successfully', assignment });
  } catch (error) {
    console.error('Error accepting assignment:', error);
    res.status(500).json({ message: 'An error occurred while accepting the assignment. Please try again later.', error: error.message });
  }
};

const rejectAssignment = async (req, res) => {
  console.log('Attempting to reject assignment:', req.params.id);
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid assignment ID. Please provide a valid assignment ID.' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found. Please check the assignment ID.' });
    }

    if (!req.user || assignment.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reject this assignment. You can only reject assignments assigned to you.' });
    }

    if (assignment.status !== 'pending') {
      return res.status(400).json({ message: 'Assignment is not in pending status. Only pending assignments can be rejected.' });
    }
    
    assignment.status = 'rejected';
    await assignment.save();
    
    console.log('Assignment rejected successfully:', assignment._id);
    res.json({ message: 'Assignment rejected successfully', assignment });
  } catch (error) {
    console.error('Error rejecting assignment:', error);
    res.status(500).json({ message: 'An error occurred while rejecting the assignment. Please try again later.', error: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAssignments,
  acceptAssignment,
  rejectAssignment
};