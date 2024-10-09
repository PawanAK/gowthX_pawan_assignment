const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getAssignments } = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/assignments',adminAuth, getAssignments);

module.exports = router;