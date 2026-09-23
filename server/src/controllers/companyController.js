const Company = require('../models/Company');
const User = require('../models/User');

// POST /api/companies
const createCompany = async (req, res) => {
  let createdCompany = null;

  try {
    const {
      companyName,
      slug,
      userName,
      username,
      password,
    } = req.body;

    if (
      !companyName?.trim() ||
      !slug?.trim() ||
      !userName?.trim() ||
      !username?.trim() ||
      !password
    ) {
      return res.status(400).json({
        message:
          'Company name, slug, user name, username and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must contain at least 8 characters',
      });
    }

    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      return res.status(400).json({
        message: 'Slug can only contain lowercase letters, numbers and hyphens',
      });
    }

    const existingCompany = await Company.findOne({
      $or: [
        { name: companyName.trim() },
        { slug: cleanSlug },
      ],
    });

    if (existingCompany) {
      return res.status(409).json({
        message: 'Company name or slug already exists',
      });
    }

    const existingUser = await User.findOne({
      username: username.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Username already exists',
      });
    }

    createdCompany = await Company.create({
      name: companyName.trim(),
      slug: cleanSlug,
    });

    const companyUser = await User.create({
      name: userName.trim(),
      username: username.trim().toLowerCase(),
      password,
      role: 'company_user',
      company: createdCompany._id,
    });

    return res.status(201).json({
      message: 'Company and login account created successfully',
      company: {
        id: createdCompany._id,
        name: createdCompany.name,
        slug: createdCompany.slug,
        isActive: createdCompany.isActive,
      },
      user: {
        id: companyUser._id,
        name: companyUser.name,
        username: companyUser.username,
        role: companyUser.role,
      },
    });
  } catch (error) {
    if (createdCompany?._id) {
      await Company.findByIdAndDelete(createdCompany._id);
    }

    console.error('Create company error:', error);

    return res.status(500).json({
      message: 'Unable to create company account',
    });
  }
};

// GET /api/companies
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .sort({ createdAt: -1 })
      .lean();

    const companyIds = companies.map((company) => company._id);

    const users = await User.find({
      company: { $in: companyIds },
      role: 'company_user',
    })
      .select('name username company isActive lastLogin')
      .lean();

    const result = companies.map((company) => ({
      ...company,
      users: users.filter(
        (user) =>
          user.company.toString() === company._id.toString()
      ),
    }));

    return res.status(200).json({
      companies: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to fetch companies',
    });
  }
};

// PATCH /api/companies/users/:userId/credentials
const updateUserCredentials = async (req, res) => {
  try {
    const { username, password } = req.body;
    const { userId } = req.params;

    if (!username?.trim()) {
      return res.status(400).json({
        message: 'Username is required',
      });
    }

    const cleanUsername = username
      .trim()
      .toLowerCase();

    if (!/^[a-z0-9_.-]{3,30}$/.test(cleanUsername)) {
      return res.status(400).json({
        message:
          'Username can only contain letters, numbers, dot, underscore and hyphen',
      });
    }

    if (password && password.length < 8) {
      return res.status(400).json({
        message:
          'Password must contain at least 8 characters',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User account not found',
      });
    }

    const usernameExists = await User.findOne({
      username: cleanUsername,
      _id: {
        $ne: user._id,
      },
    });

    if (usernameExists) {
      return res.status(409).json({
        message: 'Username already exists',
      });
    }

    user.username = cleanUsername;

    // User model ka pre-save middleware password hash karega
    if (password) {
      user.password = password;
    }

    await user.save();

    return res.status(200).json({
      message: 'Login credentials updated successfully',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        company: user.company,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(
      'Update credentials error:',
      error
    );

    return res.status(500).json({
      message: 'Unable to update credentials',
    });
  }
};





module.exports = {
  createCompany,
  getCompanies,
  updateUserCredentials,
};