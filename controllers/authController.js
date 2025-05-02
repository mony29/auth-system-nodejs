const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET } = require("../config");

// exports.register = async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const existing = await User.findOne({ username });
//     if (existing) return res.status(400).json({ msg: "User already exist" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ username, password: hashedPassword });
//     await user.save();

//     res.json({ msg: "User registered successfully" });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// };

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ msg: "All fields are required" });

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing)
    return res.status(400).json({ msg: "Username or email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });

  await user.save();
  res.json({ msg: "User registered successfully." });
};

exports.login = async (req, res) => {
  // const { username, password } = req.body;
  const { identifier, password } = req.body; // identifier = email or username
  if (!identifier || !password)
    return res.status(400).json({ msg: "All field are required" });

  // Find user by email or username
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Password not correct" });

  const token = jwt.sign({ id: user._id, username: user.username }, SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
