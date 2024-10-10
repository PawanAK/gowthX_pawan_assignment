const { verifyToken } = require('../utils/jwt');

// Utility function to handle authentication
const authenticateUser = (req) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    throw new Error('No token provided');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    throw new Error('Invalid token');
  }

  return decoded;
};

// Middleware to authenticate all users
const auth = (req, res, next) => {
  console.log('Authenticating request');
  try {
    const user = authenticateUser(req);
    console.log('User authenticated:', user.username);
    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ message: error.message });
  }
};

// Middleware to authenticate and authorize admin users
const adminAuth = (req, res, next) => {
  console.log('Checking admin authorization');
  try {
    const user = authenticateUser(req);
    if (user.role !== 'admin') {
      throw new Error('Access denied: User is not an admin');
    }
    console.log('Admin access granted:', user.username);
    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(error.message.includes('Access denied') ? 403 : 401).json({ message: error.message });
  }
};

module.exports = { auth, adminAuth };