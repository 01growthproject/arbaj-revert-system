const express = require("express");

const {
  submitReport,
  getReports,
  deleteReport,
  deleteAllReports,
} = require("../controllers/reportController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.post("/", auth, authorize("company_user"), submitReport);
router.get("/", auth, authorize("super_admin", "company_user"), getReports);
router.delete("/", auth, authorize("super_admin"), deleteAllReports);
router.delete("/:id", auth, authorize("super_admin"), deleteReport);

module.exports = router;
