const express = require('express');

const {
  bulkImportAgents,
  createAgent,
  getAgents,
  updateAgent,
  deleteAgent,
} = require('../controllers/agentController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post(
  '/bulk-import',
  auth,
  authorize('super_admin'),
  bulkImportAgents
);

router.get(
  '/',
  auth,
  authorize('super_admin', 'company_user'),
  getAgents
);

router.post(
  '/',
  auth,
  authorize('super_admin'),
  createAgent
);

router.patch(
  '/:id',
  auth,
  authorize('super_admin'),
  updateAgent
);

router.delete(
  '/:id',
  auth,
  authorize('super_admin'),
  deleteAgent
);

module.exports = router;
