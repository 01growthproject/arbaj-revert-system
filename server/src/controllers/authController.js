const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      companyId: user.company?._id || user.company || null,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
      return res.status(400).json({
        message: 'Username and password are required',
      });
    }

    const user = await User.findOne({
      username: username.trim().toLowerCase(),
    })
      .select('+password')
      .populate('company');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid username or password',
      });
    }

    const passwordMatched = await user.comparePassword(password);

    if (!passwordMatched) {
      return res.status(401).json({
        message: 'Invalid username or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Your account has been disabled',
      });
    }

    if (
      user.role === 'company_user' &&
      (!user.company || !user.company.isActive)
    ) {
      return res.status(403).json({
        message: 'Company account is inactive',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        company: user.company
          ? {
              id: user.company._id,
              name: user.company.name,
              slug: user.company.slug,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        role: req.user.role,
        company: req.user.company || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  login,
  getCurrentUser,
};