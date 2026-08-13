const express = require('express');
const router = express.Router();
const { submitReport, getReports, deleteReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');


router.post('/', submitReport);


router.get('/', auth, getReports);


router.delete('/:id', auth, deleteReport);

module.exports = router;
