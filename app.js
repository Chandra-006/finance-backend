const express = require("express");

const app = express();

// Parse incoming JSON request bodies.
app.use(express.json());

// Initialize DB and register route modules.
require("./db");
const userRoutes = require("./routes/userRoutes");
const recordRoutes = require("./routes/recordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Route groups.
app.use("/users", userRoutes);
app.use("/records", recordRoutes);
app.use("/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

module.exports = app;
