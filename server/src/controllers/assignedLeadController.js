const mongoose = require('mongoose');

const Agent = require('../models/Agent');
const AssignedLead = require('../models/AssignedLead');
const Company = require('../models/Company');
const Team = require('../models/Team');

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const normalizeName = value => String(value || '').trim().replace(/\s+/g, ' ');

// POST /api/assigned-leads/bulk-import - JSON rows parsed from CSV on frontend
const bulkImportAssignedLeads = async (req, res) => {
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
    if (!company) return res.status(404).json({ message: 'Active company not found' });

    const result = { totalRows: rows.length, imported: 0, errors: [] };

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index] || {};
      const agentName = normalizeName(row.agentName || row.name);
      const teamName = normalizeName(row.teamName);
      const assignedDate = normalizeName(row.assignedDate || row.date);
      const leadCount = Number(row.leadsAssigned ?? row.leads);

      if (!agentName || !isValidDate(assignedDate) || !Number.isInteger(leadCount) || leadCount < 0) {
        result.errors.push({
          row: index + 2,
          message: 'Valid agentName, assignedDate and non-negative whole leadsAssigned are required',
        });
        continue;
      }

      try {
        const agentFilter = {
          company: company._id,
          nameKey: agentName.toLowerCase(),
          isActive: true,
        };

        if (teamName && teamName.toLowerCase() !== 'individual') {
          const team = await Team.findOne({
            company: company._id,
            nameKey: teamName.toLowerCase(),
            isActive: true,
          });
          if (!team) throw new Error(`Active team "${teamName}" not found`);
          agentFilter.team = team._id;
        } else {
          agentFilter.team = null;
        }

        const agent = await Agent.findOne(agentFilter).populate('team', 'name isActive');
        if (!agent) throw new Error(`Active agent "${agentName}" not found in selected team`);

        await AssignedLead.findOneAndUpdate(
          { agentId: agent._id, assignedDate },
          {
            $set: {
              agentName: agent.name,
              agentId: agent._id,
              teamName: agent.team?.name || '',
              teamId: agent.team?._id || null,
              company: company.name,
              companyId: company._id,
              assignedDate,
              leadsAssigned: leadCount,
              note: normalizeName(row.note).slice(0, 250),
              assignedBy: req.user.name || 'Admin',
              assignedByUser: req.user._id,
            },
          },
          { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );
        result.imported += 1;
      } catch (error) {
        result.errors.push({ row: index + 2, message: error.message });
      }
    }

    return res.status(200).json({ message: 'Assigned leads CSV import completed', result });
  } catch (error) {
    console.error('Bulk assigned-lead import error:', error);
    return res.status(500).json({ message: 'Unable to import assigned leads' });
  }
};

// POST /api/assigned-leads - super admin only
const assignLeads = async (req, res) => {
  try {
    const { agentId, assignedDate, leadsAssigned, note } = req.body;
    const leadCount = Number(leadsAssigned);

    if (!isValidId(agentId)) {
      return res.status(400).json({ message: 'Please select a valid agent' });
    }

    if (!isValidDate(assignedDate)) {
      return res.status(400).json({ message: 'Valid assigned date is required' });
    }

    if (!Number.isInteger(leadCount) || leadCount < 0) {
      return res.status(400).json({
        message: 'Leads assigned must be a non-negative whole number',
      });
    }

    const agent = await Agent.findOne({
      _id: agentId,
      isActive: true,
    })
      .populate('company', 'name isActive')
      .populate('team', 'name isActive');

    if (!agent || !agent.company?.isActive) {
      return res.status(400).json({ message: 'Selected agent is invalid or inactive' });
    }

    if (agent.team && !agent.team.isActive) {
      return res.status(400).json({
        message: 'Selected agent belongs to an inactive team',
      });
    }

    const assignedLead = await AssignedLead.findOneAndUpdate(
      { agentId: agent._id, assignedDate },
      {
        $set: {
          agentName: agent.name,
          teamName: agent.team?.name || '',
          teamId: agent.team?._id || null,
          company: agent.company.name,
          companyId: agent.company._id,
          leadsAssigned: leadCount,
          note: note?.trim() || '',
          assignedBy: req.user.name || 'Admin',
          assignedByUser: req.user._id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).select('-__v');

    return res.status(200).json({
      message: 'Leads assigned successfully',
      data: assignedLead,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: 'Leads are already assigned to this agent for this date',
      });
    }

    console.error('Assign leads error:', error);
    return res.status(500).json({ message: 'Unable to assign leads' });
  }
};

// GET /api/assigned-leads - company user checks one verified agent
const getAgentLeads = async (req, res) => {
  try {
    const { agentId, assignedDate } = req.query;

    if (!isValidId(agentId) || !isValidDate(assignedDate)) {
      return res.status(400).json({
        message: 'Valid agentId and assignedDate are required',
      });
    }

    const companyId = req.user.company?._id;

    if (!companyId) {
      return res.status(403).json({
        message: 'Your account is not connected to a company',
      });
    }

    const agent = await Agent.findOne({
      _id: agentId,
      company: companyId,
      isActive: true,
    }).populate('team', 'name isActive');

    if (!agent || (agent.team && !agent.team.isActive)) {
      return res.status(400).json({ message: 'Selected agent is invalid or inactive' });
    }

    let lead = await AssignedLead.findOne({
      agentId: agent._id,
      assignedDate,
    }).select('-__v');

    // Temporary fallback for assignments created before agent IDs were added.
    if (!lead) {
      lead = await AssignedLead.findOne({
        agentId: null,
        company: req.user.company.name,
        agentName: {
          $regex: new RegExp(`^${escapeRegex(agent.name)}$`, 'i'),
        },
        assignedDate,
      }).select('-__v');
    }

    if (!lead) {
      return res.status(200).json({ found: false, leadsAssigned: 0 });
    }

    return res.status(200).json({
      found: true,
      leadsAssigned: lead.leadsAssigned,
      note: lead.note,
      data: lead,
    });
  } catch (error) {
    console.error('Get agent leads error:', error);
    return res.status(500).json({ message: 'Unable to fetch assigned leads' });
  }
};

// GET /api/assigned-leads/all - super admin only
const getAllAssignedLeads = async (req, res) => {
  try {
    const { companyId, agentId, teamId, assignedDate } = req.query;
    const filter = {};

    for (const [field, value] of Object.entries({ companyId, agentId, teamId })) {
      if (value) {
        if (!isValidId(value)) {
          return res.status(400).json({ message: `Invalid ${field}` });
        }
        filter[field] = value;
      }
    }

    if (assignedDate) {
      if (!isValidDate(assignedDate)) {
        return res.status(400).json({ message: 'Invalid assigned date' });
      }
      filter.assignedDate = assignedDate;
    }

    const leads = await AssignedLead.find(filter)
      .sort({ assignedDate: -1, createdAt: -1 })
      .select('-__v')
      .lean();

    return res.status(200).json({ leads });
  } catch (error) {
    console.error('Get assigned leads error:', error);
    return res.status(500).json({ message: 'Unable to fetch assigned leads' });
  }
};

// DELETE /api/assigned-leads/:id - super admin only
const deleteAssignedLead = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid assigned lead id' });
    }

    const lead = await AssignedLead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Assigned lead not found' });
    }

    return res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete assigned lead error:', error);
    return res.status(500).json({ message: 'Unable to delete assigned lead' });
  }
};

module.exports = {
  bulkImportAssignedLeads,
  assignLeads,
  getAgentLeads,
  getAllAssignedLeads,
  deleteAssignedLead,
};
