const express = require('express');
const router = express.Router();
const { submitReport, getReports, deleteReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');

// Agent submits — no auth needed
router.post('/', submitReport);

// Admin fetches — auth required
router.get('/', auth, getReports);

// Admin deletes — auth required
router.delete('/:id', auth, deleteReport);

module.exports = router;
