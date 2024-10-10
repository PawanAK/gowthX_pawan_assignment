const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAdmins, submitAssignment } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Register a new user
router.post('/register', registerUser);

// Login for existing user
router.post('/login', loginUser);

// Get list of admin users (requires authentication)
router.get('/admins', auth, getAdmins);

// Submit a new assignment (requires authentication)
router.post('/upload', auth, submitAssignment);

module.exports = router;