const jwt = require('jsonwebtoken');

const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).populate('company');

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'User account is invalid or inactive',
      });
    }

    if (
      user.role === 'company_user' &&
      (!user.company || !user.company.isActive)
    ) {
      return res.status(403).json({ message: 'Company account is inactive' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error.name, error.message);

    return res.status(401).json({
      message:
        error.name === 'TokenExpiredError'
          ? 'Token has expired'
          : 'Invalid authentication token',
    });
  }
};

module.exports = auth;
