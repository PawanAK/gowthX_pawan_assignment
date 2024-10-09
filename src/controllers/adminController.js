const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateToken } = require('../utils/jwt');
const Assignment = require('../models/assignment');

const registerAdmin = async (req, res) => {
  console.log('Attempting to register admin:', req.body.username);
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({ username, password: hashedPassword, role: 'admin' });
    await admin.save();
    console.log('Admin registered successfully:', admin.username);
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Error registering admin', error: error.message });
  }
};

const loginAdmin = async (req, res) => {
  console.log('Attempting to log in admin:', req.body.username);
  try {
    const { username, password } = req.body;
    const admin = await User.findOne({ username, role: 'admin' });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(admin);
    console.log('Admin logged in successfully:', admin.username);
    res.json({ token, admin: { id: admin._id, username: admin.username, role: admin.role } });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

const getAssignments = async (req, res) => {
    console.log('Fetching assignments for admin:', req.user.username);
    try {
      const assignments = await Assignment.find({ admin: req.user.id })
        .sort({ createdAt: -1 });
      
      console.log(`${assignments.length} assignments fetched successfully`);
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ message: 'Error fetching assignments', error: error.message });
    }
  };

module.exports = {
  registerAdmin,
  loginAdmin,
  getAssignments
};