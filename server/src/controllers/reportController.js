const mongoose = require('mongoose');

const Agent = require('../models/Agent');
const Report = require('../models/Report');

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) return 0;

  return Math.trunc(number);
};

const isValidReportDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

// POST /api/reports
const submitReport = async (req, res) => {
  try {
    const {
      agentId,
      agentName,
      reportDate,
      totalCalls,
      interested,
      notInterested,
      noPassport,
      docsReceived,
      notPickCalls,
      totalLeadsReceived,
      other,
      addReview,
    } = req.body;

    if (!req.user.company) {
      return res.status(403).json({
        message: 'Your account is not connected to a company',
      });
    }

    if (!reportDate || !isValidReportDate(reportDate)) {
      return res.status(400).json({ message: 'Valid report date is required' });
    }

    let selectedAgent = null;

    if (agentId) {
      if (!isValidId(agentId)) {
        return res.status(400).json({ message: 'Invalid agent id' });
      }

      selectedAgent = await Agent.findOne({
        _id: agentId,
        company: req.user.company._id,
        isActive: true,
      }).populate('team', 'name isActive');

      if (!selectedAgent) {
        return res.status(400).json({
          message: 'Selected agent is invalid or inactive',
        });
      }

      if (selectedAgent.team && !selectedAgent.team.isActive) {
        return res.status(400).json({
          message: 'Selected agent belongs to an inactive team',
        });
      }
    } else {
      // Temporary compatibility until the frontend dropdown is deployed.
      if (process.env.ENFORCE_AGENT_SELECTION === 'true') {
        return res.status(400).json({
          message: 'Please select a valid agent',
        });
      }

      if (!agentName?.trim()) {
        return res.status(400).json({
          message: 'Agent name is required',
        });
      }
    }

    const report = await Report.create({
      company: req.user.company.name,
      companyId: req.user.company._id,
      submittedBy: req.user._id,

      agentId: selectedAgent?._id || null,
      agentName: selectedAgent?.name || agentName.trim().replace(/\s+/g, ' '),
      teamId: selectedAgent?.team?._id || null,
      teamName: selectedAgent?.team?.name || '',
      reportDate,

      totalCalls: getNumber(totalCalls),
      interested: getNumber(interested),
      notInterested: getNumber(notInterested),
      noPassport: getNumber(noPassport),
      docsReceived: getNumber(docsReceived),
      notPickCalls: getNumber(notPickCalls),
      totalLeadsReceived: getNumber(totalLeadsReceived),

      other: other?.trim() || '',
      addReview: addReview?.trim() || '',
    });

    return res.status(201).json({
      message: 'Report submitted successfully',
      report,
    });
  } catch (error) {
    console.error('Submit report error:', error);
    return res.status(500).json({ message: 'Unable to submit report' });
  }
};

// GET /api/reports
const getReports = async (req, res) => {
  try {
    const {
      company,
      agentId,
      agentName,
      teamId,
      date,
      startDate,
      endDate,
    } = req.query;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const requestedLimit = Number(req.query.limit) || 20;
    const limit = Math.min(Math.max(requestedLimit, 1), 100);
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.user.role === 'company_user') {
      filter.$or = [
        { companyId: req.user.company._id },
        { company: req.user.company.name, companyId: null },
      ];
    }

    if (req.user.role === 'super_admin' && company) {
      filter.company = company;
    }

    if (agentId) {
      if (!isValidId(agentId)) {
        return res.status(400).json({ message: 'Invalid agent id' });
      }

      const selectedAgent = await Agent.findById(agentId)
        .populate('company', 'name')
        .select('name company')
        .lean();

      if (!selectedAgent) {
        return res.status(400).json({ message: 'Selected agent not found' });
      }

      // Include old name-only reports until every historical record has an agentId.
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { agentId: selectedAgent._id },
          {
            agentId: null,
            company: selectedAgent.company?.name,
            agentName: {
              $regex: new RegExp(`^${escapeRegex(selectedAgent.name)}$`, 'i'),
            },
          },
        ],
      });
    } else if (agentName?.trim()) {
      // Kept for finding legacy reports that do not have agentId yet.
      filter.agentName = {
        $regex: escapeRegex(agentName.trim()),
        $options: 'i',
      };
    }

    if (teamId === 'individual') {
      filter.teamId = null;
    } else if (teamId) {
      if (!isValidId(teamId)) {
        return res.status(400).json({ message: 'Invalid team id' });
      }

      filter.teamId = teamId;
    }

    if (date) {
      if (!isValidReportDate(date)) {
        return res.status(400).json({ message: 'Invalid report date' });
      }

      filter.reportDate = date;
    } else if (startDate || endDate) {
      if (
        !startDate ||
        !endDate ||
        !isValidReportDate(startDate) ||
        !isValidReportDate(endDate) ||
        startDate > endDate
      ) {
        return res.status(400).json({ message: 'Invalid date range' });
      }

      filter.reportDate = { $gte: startDate, $lte: endDate };
    }

    const [reports, summaryResult] = await Promise.all([
      Report.find(filter)
        .sort({ reportDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),

      Report.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalReports: { $sum: 1 },
            totalCalls: { $sum: { $ifNull: ['$totalCalls', 0] } },
            totalInterested: { $sum: { $ifNull: ['$interested', 0] } },
            totalDocs: { $sum: { $ifNull: ['$docsReceived', 0] } },
            totalLeads: { $sum: { $ifNull: ['$totalLeadsReceived', 0] } },
          },
        },
      ]),
    ]);

    const summary = summaryResult[0] || {
      totalReports: 0,
      totalCalls: 0,
      totalInterested: 0,
      totalDocs: 0,
      totalLeads: 0,
    };

    summary.conversionRate =
      summary.totalCalls > 0
        ? ((summary.totalInterested / summary.totalCalls) * 100).toFixed(1)
        : '0.0';

    const totalPages = Math.max(Math.ceil(summary.totalReports / limit), 1);

    return res.status(200).json({
      reports,
      summary,
      pagination: {
        currentPage: Math.min(page, totalPages),
        limit,
        totalPages,
        totalRecords: summary.totalReports,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({ message: 'Unable to fetch reports' });
  }
};

// DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid report id' });
    }

    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    return res.status(500).json({ message: 'Unable to delete report' });
  }
};

// DELETE /api/reports
const deleteAllReports = async (req, res) => {
  try {
    const { confirmation } = req.body;

    if (confirmation !== 'DELETE_ALL_REPORTS') {
      return res.status(400).json({
        message: 'Delete-all confirmation is invalid',
      });
    }

    const result = await Report.deleteMany({});

    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} reports`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Delete all reports error:', error);
    return res.status(500).json({ message: 'Unable to delete all reports' });
  }
};

module.exports = {
  submitReport,
  getReports,
  deleteReport,
  deleteAllReports,
};
