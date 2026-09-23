const express = require('express');

const {
  createTeam,
  getTeams,
  updateTeam,
  deleteTeam,
} = require('../controllers/teamController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get(
  '/',
  auth,
  authorize('super_admin', 'company_user'),
  getTeams
);

router.post(
  '/',
  auth,
  authorize('super_admin'),
  createTeam
);

router.patch(
  '/:id',
  auth,
  authorize('super_admin'),
  updateTeam
);

router.delete(
  '/:id',
  auth,
  authorize('super_admin'),
  deleteTeam
);

module.exports = router;
