const mongoose = require('mongoose');

const Company = require('../models/Company');
const Team = require('../models/Team');
const Agent = require('../models/Agent');
const Report = require('../models/Report');
const AssignedLead = require('../models/AssignedLead');

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeName = (value) => value.trim().replace(/\s+/g, ' ');

// POST /api/teams
const createTeam = async (req, res) => {
  try {
    const { companyId, name } = req.body;

    if (!isValidId(companyId) || !name?.trim()) {
      return res.status(400).json({
        message: 'Valid company and team name are required',
      });
    }

    const company = await Company.findOne({
      _id: companyId,
      isActive: true,
    });

    if (!company) {
      return res.status(404).json({
        message: 'Active company not found',
      });
    }

    const team = await Team.create({
      company: company._id,
      name: normalizeName(name),
    });

    await team.populate('company', 'name slug isActive');

    return res.status(201).json({
      message: 'Team created successfully',
      team,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: 'This team already exists in the selected company',
      });
    }

    console.error('Create team error:', error);
    return res.status(500).json({ message: 'Unable to create team' });
  }
};

// GET /api/teams
const getTeams = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'company_user') {
      filter.company = req.user.company._id;
      filter.isActive = true;
    } else {
      if (req.query.companyId) {
        if (!isValidId(req.query.companyId)) {
          return res.status(400).json({ message: 'Invalid company id' });
        }

        filter.company = req.query.companyId;
      }

      if (req.query.isActive === 'true') filter.isActive = true;
      if (req.query.isActive === 'false') filter.isActive = false;
    }

    const teams = await Team.find(filter)
      .populate('company', 'name slug isActive')
      .sort({ name: 1 })
      .select('-__v')
      .lean();

    return res.status(200).json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    return res.status(500).json({ message: 'Unable to fetch teams' });
  }
};

// PATCH /api/teams/:id
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid team id' });
    }

    if (name === undefined && typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'Team name or active status is required',
      });
    }

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (name !== undefined) {
      if (!name?.trim()) {
        return res.status(400).json({ message: 'Team name cannot be empty' });
      }

      team.name = normalizeName(name);
    }

    if (typeof isActive === 'boolean') {
      team.isActive = isActive;
    }

    await team.save();
    await team.populate('company', 'name slug isActive');

    return res.status(200).json({
      message: 'Team updated successfully',
      team,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: 'This team already exists in the selected company',
      });
    }

    console.error('Update team error:', error);
    return res.status(500).json({ message: 'Unable to update team' });
  }
};

// DELETE /api/teams/:id - only empty, unused teams can be permanently deleted
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid team id' });
    }

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const [agentCount, reportCount, assignmentCount] = await Promise.all([
      Agent.countDocuments({ team: team._id }),
      Report.countDocuments({ teamId: team._id }),
      AssignedLead.countDocuments({ teamId: team._id }),
    ]);

    if (agentCount || reportCount || assignmentCount) {
      return res.status(409).json({
        message: 'This team is in use. Move its agents first and deactivate it to preserve history.',
      });
    }

    await team.deleteOne();
    return res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    return res.status(500).json({ message: 'Unable to delete team' });
  }
};

module.exports = {
  createTeam,
  getTeams,
  updateTeam,
  deleteTeam,
};
