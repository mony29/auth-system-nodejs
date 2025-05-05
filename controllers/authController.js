const User = require("../models/User")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ACCESS_SECRET, REFRESH_SECRET } = require("../constants");


exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ msg: "All fields are required" });

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing)
    return res.status(400).json({ msg: "Username or email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });

  console.log(`user: ${user}`);

  await user.save();

  console.log(`user: ${user}`);

  res.json({ msg: "User registered successfully." });
};


exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  // console.log("req.body", req.body);

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  // console.log("User from DB:", user); // Log the entire user object

  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Password not correct" });

  const accessToken = jwt.sign(
    { id: user._id, username: user.username },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id, username: user.username },
    REFRESH_SECRET
  );

  user.refreshTokens.push(refreshToken);
  console.log("###1 saving...");
  // await user.save(); // This line fails
  await user.save({ validateBeforeSave: false }); // skip validation
  console.log("###2 success");

  res.json({ accessToken, refreshToken });
};


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ msg: "Token required" });
  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json({ msg: "Invalid refresh token" });

  try {
    const user = jwt.verify(refreshToken, REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { id: user._id, username: user.username },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ msg: "Token expired or invalid" });
  }
};
