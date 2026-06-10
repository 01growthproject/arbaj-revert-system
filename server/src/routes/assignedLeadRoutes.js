const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  assignLeads,
  getAgentLeads,
  getAllAssignedLeads,
  deleteAssignedLead
} = require('../controllers/assignedLeadController')

// ✅ Agent — apni assigned leads fetch kare (no auth needed)
router.get('/', getAgentLeads)

// ✅ Admin — sab assigned leads dekhe (auth required)
router.get('/all', auth, getAllAssignedLeads)

// ✅ Admin — leads assign kare (auth required)
router.post('/', auth, assignLeads)

// ✅ Admin — delete kare (auth required)
router.delete('/:id', auth, deleteAssignedLead)

module.exports = router