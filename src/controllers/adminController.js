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

  const acceptAssignment = async (req, res) => {
    console.log('Attempting to accept assignment:', req.params.id);
    try {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      if (assignment.admin.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to accept this assignment' });
      }
      if (assignment.status !== 'pending') {
        return res.status(400).json({ message: 'Assignment is not in pending status' });
      }
      console.log(assignment.status);
      assignment.status = 'accepted';
      console.log(assignment.status);
      await assignment.save();
      
      console.log('Assignment accepted successfully:', assignment._id);
      res.json({ message: 'Assignment accepted successfully', assignment });
    } catch (error) {
      console.error('Error accepting assignment:', error);
      res.status(500).json({ message: 'Error accepting assignment', error: error.message });
    }
  };

  const rejectAssignment = async (req, res) => {
    console.log('Attempting to reject assignment:', req.params.id);
    try {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      if (assignment.admin.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to reject this assignment' });
      }
      if (assignment.status !== 'pending') {
        return res.status(400).json({ message: 'Assignment is not in pending status' });
      }
      
      assignment.status = 'rejected';
      await assignment.save();
      
      console.log('Assignment rejected successfully:', assignment._id);
      res.json({ message: 'Assignment rejected successfully', assignment });
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      res.status(500).json({ message: 'Error rejecting assignment', error: error.message });
    }
  };


module.exports = {
  registerAdmin,
  loginAdmin,
  getAssignments,
  acceptAssignment,
  rejectAssignment
};