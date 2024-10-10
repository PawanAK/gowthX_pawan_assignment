const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getAssignments, acceptAssignment, rejectAssignment } = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

// Register a new admin
router.post('/register', registerAdmin);

// Login for admin
router.post('/login', loginAdmin);

// Get all assignments for the admin (requires authentication)
router.get('/assignments', adminAuth, getAssignments);

// Accept an assignment (requires authentication)
router.post('/assignments/:id/accept', adminAuth, acceptAssignment);

// Reject an assignment (requires authentication)
router.post('/assignments/:id/reject', adminAuth, rejectAssignment);

module.exports = router;