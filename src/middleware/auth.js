const { verifyToken } = require('../utils/jwt');

const auth = (req, res, next) => {
  console.log('Authenticating request');
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    console.log('Invalid token');
    return res.status(401).json({ message: 'Token is not valid' });
  }

  console.log('User authenticated:', decoded.username);
  req.user = decoded;
  next();
};

const adminAuth = (req, res, next) => {
  console.log('Checking admin authorization');
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      console.log('Access denied: User is not an admin');
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    console.log('Admin access granted');
    next();
  });
};

module.exports = { auth, adminAuth };