const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAdmins } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/admins', auth, getAdmins);

module.exports = router;