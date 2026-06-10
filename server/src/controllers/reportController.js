const Report = require('../models/Report');

// POST /api/reports — Agent submits report
const submitReport = async (req, res) => {
  try {
    const {
      company, agentName, reportDate,
      totalCalls, interested, notInterested,
      noPassport, docsReceived, notPickCalls,
      totalLeadsReceived, // ✅ Added
      other, addReview
    } = req.body;

    if (!company || !agentName || !reportDate) {
      return res.status(400).json({ message: 'Company, agent name and date are required' });
    }

    const report = new Report({
      company, agentName, reportDate,
      totalCalls: totalCalls || 0,
      interested: interested || 0,
      notInterested: notInterested || 0,
      noPassport: noPassport || 0,
      docsReceived: docsReceived || 0,
      notPickCalls: notPickCalls || 0,
      totalLeadsReceived: totalLeadsReceived || 0, // ✅ Added
      other: other || '',
      addReview: addReview || ''
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/reports — Admin fetches with filters
const getReports = async (req, res) => {
  try {
    const { company, agentName, date, startDate, endDate } = req.query;

    const filter = {};
    if (company) filter.company = company;
    if (agentName) filter.agentName = { $regex: agentName, $options: 'i' };
    if (date) filter.reportDate = date;
    if (startDate && endDate) {
      filter.reportDate = { $gte: startDate, $lte: endDate };
    }

    const reports = await Report.find(filter).sort({ reportDate: -1, createdAt: -1 });

    const totalReports = reports.length;
    const totalCalls = reports.reduce((s, r) => s + r.totalCalls, 0);
    const totalInterested = reports.reduce((s, r) => s + r.interested, 0);
    const totalDocs = reports.reduce((s, r) => s + r.docsReceived, 0);
    const totalLeads = reports.reduce((s, r) => s + (r.totalLeadsReceived || 0), 0); // ✅ Added
    const conversionRate = totalCalls > 0
      ? ((totalInterested / totalCalls) * 100).toFixed(1)
      : '0.0';

    res.json({
      reports,
      summary: { totalReports, totalCalls, totalInterested, totalDocs, totalLeads, conversionRate } // ✅ totalLeads added
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { submitReport, getReports, deleteReport };