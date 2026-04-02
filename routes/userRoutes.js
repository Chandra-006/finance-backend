const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { createUser, getUsers, updateUserStatus } = require("../controllers/userController");

// User management is admin-only.
router.post("/", auth(["admin"]), createUser);
router.get("/", auth(["admin"]), getUsers);
router.patch("/:id/status", auth(["admin"]), updateUserStatus);

module.exports = router;
