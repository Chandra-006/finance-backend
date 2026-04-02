const express = require("express");
const router = express.Router();

const { getSummary } = require("../controllers/dashboardController");
const auth = require("../middleware/auth");

// Dashboard is visible to all defined roles.
router.get("/", auth(["viewer", "analyst", "admin"]), getSummary);

module.exports = router;
