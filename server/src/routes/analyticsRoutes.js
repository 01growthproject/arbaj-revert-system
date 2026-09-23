const express = require('express');

const {
  getDailyAnalytics,
  generateDailySummary,
} = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(auth);
router.use(authorize('super_admin'));

router.get('/daily', getDailyAnalytics);
router.post('/daily-summary', generateDailySummary);

module.exports = router;
