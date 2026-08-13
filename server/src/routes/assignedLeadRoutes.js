const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  assignLeads,
  getAgentLeads,
  getAllAssignedLeads,
  deleteAssignedLead
} = require('../controllers/assignedLeadController')


router.get('/', getAgentLeads)


router.get('/all', auth, getAllAssignedLeads)


router.post('/', auth, assignLeads)


router.delete('/:id', auth, deleteAssignedLead)

module.exports = router