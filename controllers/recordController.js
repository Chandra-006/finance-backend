const db = require("../db");

const ALLOWED_TYPES = ["income", "expense"];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Create Record
exports.createRecord = (req, res) => {
  const body = req.body || {};
  const { amount, type, category, date, notes, user_id } = body;

  if (amount === undefined || !type || !category || !date || !user_id) {
    return res.status(400).json({ error: "amount, type, category, date, user_id are required" });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ error: "type must be income or expense" });
  }

  if (!DATE_REGEX.test(date)) {
    return res.status(400).json({ error: "date must be YYYY-MM-DD" });
  }

  const query = `
    INSERT INTO records (amount, type, category, date, notes, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [amount, type, category, date, notes || "", user_id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(201).json({
      message: "Record created successfully",
      recordId: this.lastID
    });
  });
};

// Get Records with filters
exports.getRecords = (req, res) => {
  const { type, category, startDate, endDate } = req.query;

  if (type && !ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ error: "type filter must be income or expense" });
  }

  if (startDate && !DATE_REGEX.test(startDate)) {
    return res.status(400).json({ error: "startDate must be YYYY-MM-DD" });
  }

  if (endDate && !DATE_REGEX.test(endDate)) {
    return res.status(400).json({ error: "endDate must be YYYY-MM-DD" });
  }

  let query = "SELECT * FROM records WHERE 1=1";
  const params = [];

  // Build SQL incrementally so only provided filters are applied.
  if (type) {
    query += " AND type = ?";
    params.push(type);
  }

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  if (startDate && endDate) {
    query += " AND date BETWEEN ? AND ?";
    params.push(startDate, endDate);
  }

  query += " ORDER BY date DESC, id DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.json(rows);
  });
};

// Update Record
exports.updateRecord = (req, res) => {
  const { id } = req.params;
  const body = req.body || {};
  const { amount, type, category, date, notes } = body;

  if (amount === undefined || !type || !category || !date) {
    return res.status(400).json({ error: "amount, type, category, and date are required" });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ error: "type must be income or expense" });
  }

  if (!DATE_REGEX.test(date)) {
    return res.status(400).json({ error: "date must be YYYY-MM-DD" });
  }

  const query = `
    UPDATE records
    SET amount=?, type=?, category=?, date=?, notes=?
    WHERE id=?
  `;

  db.run(query, [amount, type, category, date, notes || "", id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      // Avoid returning success for unknown ids.
      return res.status(404).json({ error: "Record not found" });
    }

    return res.json({ message: "Record updated successfully" });
  });
};

// Delete Record
exports.deleteRecord = (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM records WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      // Distinguish "already missing" from successful deletion.
      return res.status(404).json({ error: "Record not found" });
    }

    return res.json({ message: "Record deleted successfully" });
  });
};
