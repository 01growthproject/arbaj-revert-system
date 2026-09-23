const mongoose = require('mongoose');
const Agent = require('../models/Agent');
const AssignedLead = require('../models/AssignedLead');
const Company = require('../models/Company');
const Report = require('../models/Report');

const isValidId = value => mongoose.Types.ObjectId.isValid(value);

const isValidDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const buildDailyAnalytics = async ({ date, companyId }) => {
  const companyFilter = {};
  const reportFilter = { reportDate: date };
  const assignedLeadFilter = { assignedDate: date };

  if (companyId) {
    companyFilter.company = companyId;
    reportFilter.companyId = new mongoose.Types.ObjectId(companyId);
    assignedLeadFilter.companyId = new mongoose.Types.ObjectId(companyId);
  }

  const [agents, reports, assignedLeads] = await Promise.all([
    Agent.find({ ...companyFilter, isActive: true })
      .populate('company', 'name slug isActive')
      .populate('team', 'name isActive')
      .sort({ name: 1 })
      .lean(),
    Report.find(reportFilter).sort({ createdAt: -1 }).lean(),
    AssignedLead.find(assignedLeadFilter).lean(),
  ]);

  const eligibleAgents = agents.filter(
    agent => agent.company?.isActive && (!agent.team || agent.team.isActive)
  );

  const reportsByAgent = new Map();
  for (const report of reports) {
    const key = report.agentId?.toString();
    if (!key) continue;
    const current = reportsByAgent.get(key) || [];
    current.push(report);
    reportsByAgent.set(key, current);
  }

  const assignedByAgent = new Map();
  for (const assignedLead of assignedLeads) {
    const key = assignedLead.agentId?.toString();
    if (!key) continue;
    assignedByAgent.set(
      key,
      (assignedByAgent.get(key) || 0) + (assignedLead.leadsAssigned || 0)
    );
  }

  const tracker = eligibleAgents.map(agent => {
    const key = agent._id.toString();
    const agentReports = reportsByAgent.get(key) || [];
    const assignedCount = assignedByAgent.get(key) || 0;
    const totals = agentReports.reduce(
      (sum, report) => ({
        totalCalls: sum.totalCalls + (report.totalCalls || 0),
        interested: sum.interested + (report.interested || 0),
        docsReceived: sum.docsReceived + (report.docsReceived || 0),
      }),
      { totalCalls: 0, interested: 0, docsReceived: 0 }
    );
    return {
      agentId: agent._id,
      agentName: agent.name,
      companyId: agent.company._id,
      companyName: agent.company.name,
      teamId: agent.team?._id || null,
      teamName: agent.team?.name || 'Individual',
      submitted: agentReports.length > 0,
      reportCount: agentReports.length,
      assignedLeads: assignedCount,
      completedCalls: totals.totalCalls,
      pendingLeads: Math.max(assignedCount - totals.totalCalls, 0),
      completionRate: assignedCount > 0
        ? Number(((totals.totalCalls / assignedCount) * 100).toFixed(1))
        : 0,
      interested: totals.interested,
      docsReceived: totals.docsReceived,
    };
  });

  const teamMap = new Map();
  for (const item of tracker) {
    const key = item.teamId?.toString() || `individual:${item.companyId}`;
    const current = teamMap.get(key) || {
      teamId: item.teamId,
      teamName: item.teamName,
      companyId: item.companyId,
      companyName: item.companyName,
      totalAgents: 0,
      submittedAgents: 0,
      assignedLeads: 0,
      completedCalls: 0,
      interested: 0,
      docsReceived: 0,
    };
    current.totalAgents += 1;
    current.submittedAgents += item.submitted ? 1 : 0;
    current.assignedLeads += item.assignedLeads;
    current.completedCalls += item.completedCalls;
    current.interested += item.interested;
    current.docsReceived += item.docsReceived;
    teamMap.set(key, current);
  }

  const teamPerformance = [...teamMap.values()]
    .map(team => ({
      ...team,
      pendingLeads: Math.max(team.assignedLeads - team.completedCalls, 0),
      completionRate: team.assignedLeads > 0
        ? Number(((team.completedCalls / team.assignedLeads) * 100).toFixed(1))
        : 0,
    }))
    .sort((a, b) => b.completedCalls - a.completedCalls);

  const totals = tracker.reduce(
    (sum, item) => ({
      totalAgents: sum.totalAgents + 1,
      submittedAgents: sum.submittedAgents + (item.submitted ? 1 : 0),
      assignedLeads: sum.assignedLeads + item.assignedLeads,
      completedCalls: sum.completedCalls + item.completedCalls,
      interested: sum.interested + item.interested,
      docsReceived: sum.docsReceived + item.docsReceived,
    }),
    {
      totalAgents: 0,
      submittedAgents: 0,
      assignedLeads: 0,
      completedCalls: 0,
      interested: 0,
      docsReceived: 0,
    }
  );

  totals.pendingAgents = totals.totalAgents - totals.submittedAgents;
  totals.pendingLeads = Math.max(totals.assignedLeads - totals.completedCalls, 0);
  totals.submissionRate = totals.totalAgents > 0
    ? Number(((totals.submittedAgents / totals.totalAgents) * 100).toFixed(1))
    : 0;
  totals.completionRate = totals.assignedLeads > 0
    ? Number(((totals.completedCalls / totals.assignedLeads) * 100).toFixed(1))
    : 0;
  return { date, totals, tracker, teamPerformance };
};

const getGeminiResponseText = responseData => {
  if (typeof responseData?.output_text === 'string') {
    return responseData.output_text.trim();
  }

  return (responseData?.steps || [])
    .flatMap(step => step.content || step.output || [])
    .map(item => item?.text || '')
    .filter(Boolean)
    .join('\n')
    .trim();
};

const generateDailySummary = async (req, res) => {
  try {
    const date = req.body.date;
    const companyId = req.body.companyId || '';

    if (!isValidDate(date)) {
      return res.status(400).json({ message: 'Valid date is required' });
    }
    if (companyId && !isValidId(companyId)) {
      return res.status(400).json({ message: 'Invalid company id' });
    }
    if (companyId && !(await Company.exists({ _id: companyId }))) {
      return res.status(404).json({ message: 'Company not found' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        message: 'AI summary is not configured. Add GEMINI_API_KEY in server .env',
      });
    }

    const analytics = await buildDailyAnalytics({ date, companyId });
    const company = companyId
      ? await Company.findById(companyId).select('name').lean()
      : null;

    const safeData = {
      date,
      company: company?.name || 'All companies',
      totals: analytics.totals,
      teams: analytics.teamPerformance.map(team => ({
        team: team.teamName,
        company: team.companyName,
        activeAgents: team.totalAgents,
        submittedAgents: team.submittedAgents,
        assignedLeads: team.assignedLeads,
        completedCalls: team.completedCalls,
        interested: team.interested,
        docsReceived: team.docsReceived,
        pendingLeads: team.pendingLeads,
        completionRate: team.completionRate,
      })),
    };

    const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-lite';
    const modelAttempts = [primaryModel, primaryModel, fallbackModel];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000);
    let responseData = {};
    let usedModel = primaryModel;
    let lastErrorMessage = 'Unable to generate AI summary';

    try {
      for (let attempt = 0; attempt < modelAttempts.length; attempt += 1) {
        const model = modelAttempts[attempt];
        const aiResponse = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/interactions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
              model,
              store: false,
              system_instruction:
                'You are an operations analyst for an immigration leads team. Use only the supplied numbers. Write concise professional English. Do not invent causes or data. Return plain text with exactly these headings: Daily Overview, Best Performance, Attention Needed, Recommended Actions. Use short bullet points under each heading.',
              input: `Create the daily operations summary from this JSON:\n${JSON.stringify(safeData)}`,
              generation_config: {
                max_output_tokens: 550,
                temperature: 0.2,
                thinking_level: 'low',
              },
            }),
            signal: controller.signal,
          }
        );

        responseData = await aiResponse.json().catch(() => ({}));
        if (aiResponse.ok) {
          usedModel = model;
          break;
        }

        lastErrorMessage = responseData?.error?.message || lastErrorMessage;
        console.error(`Gemini ${model} error:`, responseData?.error || responseData);

        const canRetry = [404, 429, 500, 502, 503, 504].includes(aiResponse.status);
        if (!canRetry) {
          return res.status(502).json({ message: lastErrorMessage });
        }

        if (attempt < modelAttempts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      }
    } finally {
      clearTimeout(timeout);
    }

    const summary = getGeminiResponseText(responseData);
    if (!summary) {
      return res.status(502).json({ message: lastErrorMessage });
    }

    return res.status(200).json({
      date,
      company: safeData.company,
      summary,
      model: usedModel,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI daily summary error:', error);
    const message = error.name === 'AbortError'
      ? 'AI summary request timed out. Please try again.'
      : 'Unable to generate AI summary';
    return res.status(500).json({ message });
  }
};

const getDailyAnalytics = async (req, res) => {
  try {
    const date = req.query.date;
    const companyId = req.query.companyId || '';

    if (!isValidDate(date)) {
      return res.status(400).json({ message: 'Valid date is required' });
    }
    if (companyId && !isValidId(companyId)) {
      return res.status(400).json({ message: 'Invalid company id' });
    }
    if (companyId && !(await Company.exists({ _id: companyId }))) {
      return res.status(404).json({ message: 'Company not found' });
    }

    return res.status(200).json(await buildDailyAnalytics({ date, companyId }));
  } catch (error) {
    console.error('Daily analytics error:', error);
    return res.status(500).json({ message: 'Unable to load daily analytics' });
  }
};

module.exports = { getDailyAnalytics, generateDailySummary };
