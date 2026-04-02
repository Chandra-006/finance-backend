const db = require("../db");

const ALLOWED_ROLES = ["viewer", "analyst", "admin"];
const ALLOWED_STATUS = ["active", "inactive"];

// Create User
exports.createUser = (req, res) => {
  const body = req.body || {};
  const { name, email, role } = body;
  const status = body.status || "active";

  // Required fields + enum checks keep user data consistent.
  if (!name || !email || !role) {
    return res.status(400).json({ error: "name, email, and role are required" });
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: "Invalid role. Use viewer, analyst, or admin" });
  }

  if (!ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({ error: "Invalid status. Use active or inactive" });
  }

  const query = `
    INSERT INTO users (name, email, role, status)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [name, email, role, status], function (err) {
    if (err) {
      // Surface duplicate-email as a business-level conflict.
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({ error: "Email already exists" });
      }
      return res.status(500).json({ error: err.message });
    }

    return res.status(201).json({
      message: "User created successfully",
      userId: this.lastID
    });
  });
};

// Get Users
exports.getUsers = (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(rows);
  });
};

// Update User Status
exports.updateUserStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!status || !ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({ error: "Invalid status. Use active or inactive" });
  }

  db.run("UPDATE users SET status=? WHERE id=?", [status, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      // UPDATE succeeded technically, but no matching row existed.
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ message: "User status updated successfully" });
  });
};
