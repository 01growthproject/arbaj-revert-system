const mongoose = require('mongoose');

const Agent = require('../models/Agent');
const Company = require('../models/Company');
const Team = require('../models/Team');
const Report = require('../models/Report');
const AssignedLead = require('../models/AssignedLead');

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeName = (value) => value.trim().replace(/\s+/g, ' ');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findValidTeam = async (teamId, companyId) => {
  if (teamId === null || teamId === undefined || teamId === '') {
    return null;
  }

  if (!isValidId(teamId)) return undefined;

  return Team.findOne({
    _id: teamId,
    company: companyId,
    isActive: true,
  });
};

const getBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === '') return fallback;
  return !['false', '0', 'no', 'inactive'].includes(String(value).trim().toLowerCase());
};

// POST /api/agents/bulk-import - JSON rows parsed from CSV on the frontend
const bulkImportAgents = async (req, res) => {
  try {
    const { companyId, rows } = req.body;

    if (!isValidId(companyId)) {
      return res.status(400).json({ message: 'Please select a valid company' });
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'CSV does not contain any data rows' });
    }
    if (rows.length > 1000) {
      return res.status(400).json({ message: 'Maximum 1000 rows are allowed per import' });
    }

    const company = await Company.findOne({ _id: companyId, isActive: true });
    if (!company) {
      return res.status(404).json({ message: 'Active company not found' });
    }

    const result = { totalRows: rows.length, created: 0, updated: 0, errors: [] };

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index] || {};
      const agentName = normalizeName(String(row.agentName || row.name || ''));
      const rawTeamName = normalizeName(String(row.teamName || ''));
      const isIndividual = !rawTeamName || rawTeamName.toLowerCase() === 'individual';

      if (!agentName) {
        result.errors.push({ row: index + 2, message: 'Agent name is required' });
        continue;
      }

      try {
        let team = null;
        if (!isIndividual) {
          team = await Team.findOne({
            company: company._id,
            nameKey: rawTeamName.toLowerCase(),
          });

          if (!team) {
            team = await Team.create({ company: company._id, name: rawTeamName });
          } else if (!team.isActive) {
            team.isActive = true;
            await team.save();
          }
        }

        let agent = await Agent.findOne({
          company: company._id,
          team: team?._id || null,
          nameKey: agentName.toLowerCase(),
        });

        if (agent) {
          agent.name = agentName;
          agent.isActive = getBoolean(row.isActive, true);
          await agent.save();
          result.updated += 1;
        } else {
          agent = await Agent.create({
            company: company._id,
            team: team?._id || null,
            name: agentName,
            isActive: getBoolean(row.isActive, true),
          });
          result.created += 1;
        }
      } catch (error) {
        result.errors.push({
          row: index + 2,
          message: error?.code === 11000 ? 'Duplicate team or agent' : error.message,
        });
      }
    }

    return res.status(200).json({ message: 'CSV import completed', result });
  } catch (error) {
    console.error('Bulk agent import error:', error);
    return res.status(500).json({ message: 'Unable to import teams and agents' });
  }
};

// POST /api/agents
const createAgent = async (req, res) => {
  try {
    const { companyId, name, teamId } = req.body;

    if (!isValidId(companyId) || !name?.trim()) {
      return res.status(400).json({
        message: 'Valid company and agent name are required',
      });
    }

    const company = await Company.findOne({
      _id: companyId,
      isActive: true,
    });

    if (!company) {
      return res.status(404).json({ message: 'Active company not found' });
    }

    const team = await findValidTeam(teamId, company._id);

    if (team === undefined || (teamId && !team)) {
      return res.status(400).json({
        message: 'Selected team is invalid, inactive or belongs to another company',
      });
    }

    const agent = await Agent.create({
      company: company._id,
      name: normalizeName(name),
      team: team?._id || null,
    });

    await agent.populate([
      { path: 'company', select: 'name slug isActive' },
      { path: 'team', select: 'name isActive' },
    ]);

    return res.status(201).json({
      message: 'Agent created successfully',
      agent,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: 'This agent already exists in the selected team',
      });
    }

    console.error('Create agent error:', error);
    return res.status(500).json({ message: 'Unable to create agent' });
  }
};

// GET /api/agents
const getAgents = async (req, res) => {
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

    if (req.query.teamId === 'individual') {
      filter.team = null;
    } else if (req.query.teamId) {
      if (!isValidId(req.query.teamId)) {
        return res.status(400).json({ message: 'Invalid team id' });
      }

      filter.team = req.query.teamId;
    }

    if (req.query.search?.trim()) {
      filter.name = {
        $regex: escapeRegex(req.query.search.trim()),
        $options: 'i',
      };
    }

    let agents = await Agent.find(filter)
      .populate('company', 'name slug isActive')
      .populate('team', 'name isActive')
      .sort({ name: 1 })
      .select('-__v')
      .lean();

    // Company form must not show agents assigned to an inactive team.
    if (req.user.role === 'company_user') {
      agents = agents.filter((agent) => !agent.team || agent.team.isActive);
    }

    return res.status(200).json({ agents });
  } catch (error) {
    console.error('Get agents error:', error);
    return res.status(500).json({ message: 'Unable to fetch agents' });
  }
};

// PATCH /api/agents/:id
const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, teamId, isActive } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid agent id' });
    }

    if (
      name === undefined &&
      teamId === undefined &&
      typeof isActive !== 'boolean'
    ) {
      return res.status(400).json({
        message: 'Agent name, team or active status is required',
      });
    }

    const agent = await Agent.findById(id);

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (name !== undefined) {
      if (!name?.trim()) {
        return res.status(400).json({ message: 'Agent name cannot be empty' });
      }

      agent.name = normalizeName(name);
    }

    if (teamId !== undefined) {
      const team = await findValidTeam(teamId, agent.company);

      if (team === undefined || (teamId && !team)) {
        return res.status(400).json({
          message: 'Selected team is invalid, inactive or belongs to another company',
        });
      }

      agent.team = team?._id || null;
    }

    if (typeof isActive === 'boolean') {
      agent.isActive = isActive;
    }

    await agent.save();
    await agent.populate([
      { path: 'company', select: 'name slug isActive' },
      { path: 'team', select: 'name isActive' },
    ]);

    return res.status(200).json({
      message: 'Agent updated successfully',
      agent,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: 'This agent already exists in the selected team',
      });
    }

    console.error('Update agent error:', error);
    return res.status(500).json({ message: 'Unable to update agent' });
  }
};

// DELETE /api/agents/:id - used agents must be deactivated, not deleted
const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid agent id' });
    }

    const agent = await Agent.findById(id);

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const [reportCount, assignmentCount] = await Promise.all([
      Report.countDocuments({ agentId: agent._id }),
      AssignedLead.countDocuments({ agentId: agent._id }),
    ]);

    if (reportCount || assignmentCount) {
      return res.status(409).json({
        message: 'This agent has reports or assigned leads. Deactivate the agent to preserve history.',
      });
    }

    await agent.deleteOne();
    return res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    return res.status(500).json({ message: 'Unable to delete agent' });
  }
};

module.exports = {
  bulkImportAgents,
  createAgent,
  getAgents,
  updateAgent,
  deleteAgent,
};
