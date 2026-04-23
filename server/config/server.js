console.log("🔥 RUNNING SERVER FILE:", __filename);
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// TEST ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("API working");
});

// =======================
// REGISTER USER
// =======================
app.post("/api/users", (req, res) => {
  const { name, email, phone, password, role } = req.body;

  console.log("🔥 Saving user:", req.body);

  const sql = `
    INSERT INTO users (name, email, phone, password, role)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, email, phone, password, role], (err, result) => {
    if (err) {
      console.log("❌ DB Error:", err.message);
      return res.json({ success: false, error: err.message });
    }

    res.json({
      success: true,
      message: "User saved",
      userId: result.insertId
    });
  });
});


//added
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      return res.json({
        success: false,
        error: {
          message: "Database error during login",
          details: err.message
        }
      });
    }

    if (results.length === 0) {
      return res.json({
        success: false,
        error: {
          message: "Invalid email or password"
        }
      });
    }

    const user = results[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

// =======================
// GET ALL WORKSPACES
// =======================
app.get("/api/workspaces", (req, res) => {
  const sql = "SELECT * FROM workspaces";

  db.query(sql, (err, results) => {
    if (err) {
      console.log("❌ DB Error:", err.message);
      return res.json({ success: false });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

// =======================
// GET WORKSPACE BY ID (DETAILS PAGE)
// =======================
app.get("/api/workspaces/:id", (req, res) => {
  const id = req.params.id;

  console.log("🔥 Fetching workspace ID:", id);

  const sql = "SELECT * FROM workspaces WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.log("❌ DB Error:", err.message);
      return res.json({ success: false, error: err.message });
    }

    if (results.length === 0) {
      return res.json({
        success: false,
        message: "Workspace not found"
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});

// =======================
// START SERVER
// =======================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});