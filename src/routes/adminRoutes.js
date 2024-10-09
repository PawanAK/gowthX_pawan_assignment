const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getAssignments, acceptAssignment,rejectAssignment } = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/assignments',adminAuth, getAssignments);
router.post('/assignments/:id/accept',adminAuth, acceptAssignment);
router.post('/assignments/:id/reject',adminAuth, rejectAssignment);


module.exports = router;