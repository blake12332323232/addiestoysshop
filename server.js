// ==========================
// Addie's Toy Shop Server
// ==========================

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const twilio = require("twilio");

const app = express();
const PORT = 3000; // CHANGE THIS if you want a different port

// ===== Twilio setup =====
// CHANGE THESE with your Twilio account info
const accountSid = "YOUR_TWILIO_ACCOUNT_SID"; // Twilio Account SID
const authToken = "YOUR_TWILIO_AUTH_TOKEN";   // Twilio Auth Token
const fromNumber = "+1234567890";             // Your Twilio number
const toNumber = "+1987654321";               // Your phone number to receive orders

const client = twilio(accountSid, authToken);

// ===== Middleware =====
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(".")); // Serve index.html + index.js
app.use(session({
  secret: "addiestoyshopsecret",
  resave: false,
  saveUninitialized: true,
}));

// ===== In-memory storage =====
const users = {};   // { username: { password: "pass", dailyCount: 0 } }
const DAILY_LIMIT = 5; // CHANGE THIS to adjust daily purchase limit

// ===== Routes =====

// Register a new user
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.send("Fill both fields");
  if (users[username]) return res.send("Username already exists");
  users[username] = { password, dailyCount: 0 };
  res.send("Registered successfully! Please login.");
});

// Login existing user
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!users[username]) return res.send("User not found");
  if (users[username].password !== password) return res.send("Incorrect password");
  req.session.user = username;
  res.send("Logged in successfully!");
});

// Logout user
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.send("Logged out");
});

// Place an order
app.post("/buy", (req, res) => {
  const username = req.session.user;
  if (!username) return res.send("Please login first");

  const qty = parseInt(req.body.quantity) || 1;

  if (!users[username].dailyCount) users[username].dailyCount = 0;

  if (users[username].dailyCount + qty > DAILY_LIMIT) {
    return res.send(`Daily limit reached! You can only buy ${DAILY_LIMIT - users[username].dailyCount} more today.`);
  }

  users[username].dailyCount += qty;

  // ===== Twilio SMS Notification =====
  client.messages.create({
    body: `New Order from ${username}: ${qty} toy(s). Total today: ${users[username].dailyCount}`,
    from: fromNumber,
    to: toNumber
  })
  .then(message => console.log("Twilio message sent:", message.sid))
  .catch(err => console.error("Twilio error:", err));

  res.send(`Order successful! You bought ${qty} toy(s). Total today: ${users[username].dailyCount}`);
});

// ===== Start server =====
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
