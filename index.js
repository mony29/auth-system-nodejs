const express = require("express");
const mongoose = require("mongoose");
const { MONGO_URI } = require("./config");
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);

// Connect MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => console.error(err));

/**
 * Before using in memory-storage
 * 
 * const express = require("express");
const users = require("./users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/auth");

const app = express();

// Body parser
app.use(express.json());

// Secret for JWT (in real app, we keep this in .env)
const SECRET = "secret-key";

// Register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (users[username])
    return res.status(400).json({ msg: "User already exist" });

  const hashedPassword = await bcrypt.hash(password, 10);
  // save user
  users[username] = { username, password: hashedPassword };
  //   console.log(`username: ${username}, password: ${hashedPassword}`);

  res.json({ msg: "User register successfully" });
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users[username];
  if (!user) return res.status(400).json({ msg: "Username not correct" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Password not correct" });

  const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Protected route
app.get("/profile", authMiddleware(SECRET), (req, res) => {
  res.json({ msg: `User information`, user: req.user });
});

app.listen(3000, () => console.log("Server running on port 3000"));

 */
