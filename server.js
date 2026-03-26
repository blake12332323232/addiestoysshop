const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const PORT = 3000;

// ===== Middleware =====
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("."));
app.use(session({
  secret: "addiestoyshopsecret",
  resave: false,
  saveUninitialized: true,
}));

// ===== In-memory storage =====
const users = {};   // { username: { password: "pass", dailyCount: 0 } }

// ===== Routes =====
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.send("Fill both fields");
  if (users[username]) return res.send("Username already exists");
  users[username] = { password, dailyCount: 0 };
  res.send("Registered successfully! Please login.");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!users[username]) return res.send("User not found");
  if (users[username].password !== password) return res.send("Incorrect password");
  req.session.user = username;
  res.send("Logged in successfully!");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.send("Logged out");
});

app.post("/buy", (req, res) => {
  const username = req.session.user;
  if (!username) return res.send("Please login first");
  const qty = parseInt(req.body.quantity) || 1;
  const DAILY_LIMIT = 5;
  if (!users[username].dailyCount) users[username].dailyCount = 0;
  if (users[username].dailyCount + qty > DAILY_LIMIT) {
    return res.send(`Daily limit reached! You can only buy ${DAILY_LIMIT - users[username].dailyCount} more today.`);
  }
  users[username].dailyCount += qty;
  // You could integrate Twilio here to notify orders
  res.send(`Order successful! You bought ${qty} toy(s). Total today: ${users[username].dailyCount}`);
});

// ===== Start server =====
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
