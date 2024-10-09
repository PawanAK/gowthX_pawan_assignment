const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/user');
const Assignment = require('../models/assignment');
const { generateToken } = require('../utils/jwt');

const registerUser = async (req, res) => {
  console.log('Attempting to register user:', req.body.username);
  try {
    const { username, password, role } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ message: 'Invalid username. Username must be a string with at least 3 characters.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Invalid password. Password must be a string with at least 6 characters.' });
    }

    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Role must be either "user" or "admin".' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists. Please choose a different username.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    console.log('User registered successfully:', user.username);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'An error occurred while registering the user. Please try again later.', error: error.message });
  }
};

const loginUser = async (req, res) => {
  console.log('Attempting to log in user:', req.body.username);
  try {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ message: 'Invalid username. Username must be a non-empty string.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid password. Password must be a non-empty string.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. Please check your username and password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Please check your username and password.' });
    }
    const token = generateToken(user);
    console.log('User logged in successfully:', user.username);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'An error occurred while logging in. Please try again later.', error: error.message });
  }
};

const getAdmins = async (req, res) => {
  console.log('Fetching admins');
  try {
    const admins = await User.find({ role: 'admin' }, 'username');
    console.log('Admins fetched successfully');
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'An error occurred while fetching admins. Please try again later.', error: error.message });
  }
};

const submitAssignment = async (req, res) => {
  console.log('Attempting to submit assignment');
  try {
    const { task, adminId } = req.body;
    const userId = req.user.id;

    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      return res.status(400).json({ message: 'Invalid task. Task must be a non-empty string.' });
    }

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ message: 'Invalid adminId. Please provide a valid admin ID.' });
    }

    const adminExists = await User.exists({ _id: adminId, role: 'admin' });
    if (!adminExists) {
      return res.status(404).json({ message: 'Admin not found. Please provide a valid admin ID.' });
    }

    const assignment = new Assignment({
      userId,
      task,
      admin: adminId,
    });

    await assignment.save();
    console.log('Assignment submitted successfully');
    res.status(201).json({ message: 'Assignment submitted successfully', assignment });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'An error occurred while submitting the assignment. Please try again later.', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAdmins,
  submitAssignment
};