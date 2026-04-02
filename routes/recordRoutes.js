const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  createRecord,
  updateRecord,
  deleteRecord,
  getRecords
} = require("../controllers/recordController");

// Write operations are restricted to admin.
router.post("/", auth(["admin"]), createRecord);
router.put("/:id", auth(["admin"]), updateRecord);
router.delete("/:id", auth(["admin"]), deleteRecord);

// Read access for admin and analyst.
router.get("/", auth(["admin", "analyst"]), getRecords);

module.exports = router;
