const express = require('express');

const router = express.Router();

const {
  createCompany,
  getCompanies,
  updateUserCredentials,
} = require('../controllers/companyController');

const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(auth);
router.use(authorize('super_admin'));

router.post('/', createCompany);
router.get('/', getCompanies);

router.patch(
  '/users/:userId/credentials',
  updateUserCredentials
);

module.exports = router;
