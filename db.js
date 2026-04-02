const sqlite3 = require("sqlite3").verbose();

// Allow test DB override; default to local SQLite file.
const dbPath = process.env.DB_PATH || "./database.sqlite";
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
    return;
  }

  console.log("Connected to SQLite database");

  // Keep table creation in order on startup.
  db.serialize(() => {
    // Users store role and active/inactive status.
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        role TEXT,
        status TEXT
      )
    `);

    // Records store finance entries linked to users.
    db.run(`
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL,
        type TEXT,
        category TEXT,
        date TEXT,
        notes TEXT,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);
  });
});

module.exports = db;
