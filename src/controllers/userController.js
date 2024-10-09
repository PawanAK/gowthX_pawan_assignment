const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Assignment = require('../models/assignment');
const { generateToken } = require('../utils/jwt');

const registerUser = async (req, res) => {
  console.log('Attempting to register user:', req.body.username);
  try {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    console.log('User registered successfully:', user.username);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

const loginUser = async (req, res) => {
  console.log('Attempting to log in user:', req.body.username);
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    console.log('User logged in successfully:', user.username);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
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
    res.status(500).json({ message: 'Error fetching admins', error: error.message });
  }
};

const submitAssignment = async (req, res) => {
    console.log('Attempting to submit assignment');
    try {
      const { task, adminId } = req.body;
      const userId = req.user.id; // This comes from the auth middleware
  
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
      res.status(500).json({ message: 'Error submitting assignment', error: error.message });
    }
  };

module.exports = {
    registerUser,
    loginUser,
    getAdmins,
    submitAssignment
  };