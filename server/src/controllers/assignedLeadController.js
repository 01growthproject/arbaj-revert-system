const AssignedLead = require('../models/AssignedLead')

// ✅ POST /api/assigned-leads — Admin leads assign kare
const assignLeads = async (req, res) => {
  try {
    const { agentName, company, assignedDate, leadsAssigned, note } = req.body

    if (!agentName || !company || !assignedDate || leadsAssigned === undefined) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Pehle se assigned hai toh update karo, nahi toh naya banao
    const existing = await AssignedLead.findOneAndUpdate(
      { agentName: agentName.trim(), company, assignedDate },
      { leadsAssigned, note: note || '', assignedBy: 'Admin' },
      { new: true, upsert: true }
    )

    res.status(200).json({ message: 'Leads assigned successfully', data: existing })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ✅ GET /api/assigned-leads — Agent apni assigned leads fetch kare (no auth)
const getAgentLeads = async (req, res) => {
  try {
    const { agentName, company, assignedDate } = req.query

    if (!agentName || !company || !assignedDate) {
      return res.status(400).json({ message: 'agentName, company and assignedDate required' })
    }

    // Date normalize karo — YYYY-MM-DD format ensure karo
    let normalizedDate = assignedDate
    if (assignedDate && assignedDate.includes('-') && assignedDate.length === 10) {
      // Already YYYY-MM-DD format mein hai
      normalizedDate = assignedDate
    }

    const lead = await AssignedLead.findOne({
      agentName: { $regex: new RegExp(`^${agentName.trim()}$`, 'i') },
      company,
      assignedDate: normalizedDate
    })

    if (!lead) {
      return res.json({ found: false, leadsAssigned: 0 })
    }

    res.json({ found: true, leadsAssigned: lead.leadsAssigned, note: lead.note, data: lead })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ✅ GET /api/assigned-leads/all — Admin sab assigned leads dekhe
const getAllAssignedLeads = async (req, res) => {
  try {
    const { company, assignedDate, agentName } = req.query
    const filter = {}
    if (company) filter.company = company
    if (assignedDate) filter.assignedDate = assignedDate
    if (agentName) filter.agentName = { $regex: agentName, $options: 'i' }

    const leads = await AssignedLead.find(filter).sort({ assignedDate: -1, createdAt: -1 })
    res.json({ leads })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ✅ DELETE /api/assigned-leads/:id — Admin delete kare
const deleteAssignedLead = async (req, res) => {
  try {
    await AssignedLead.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { assignLeads, getAgentLeads, getAllAssignedLeads, deleteAssignedLead }