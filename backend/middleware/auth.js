const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Make sure to import your User model

module.exports = async function(req, res, next) {
  try {
    const authHeader = req.header('Authorization');
    console.log('Full Authorization header:', authHeader);

    const token = authHeader?.split(' ')[1];
    console.log('Extracted token:', token);

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    const user = await User.findById(decoded.userId);
    console.log('Found user:', user);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
