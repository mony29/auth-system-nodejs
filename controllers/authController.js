import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ACCESS_SECRET, REFRESH_SECRET } from "../constants.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ msg: "All fields are required" });

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing)
    return res.status(400).json({ msg: "Username or email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });

 //// console.log(`user: ${user}`);

  await user.save();

 //// console.log(`user: ${user}`);

  res.json({ msg: "User registered successfully." });
};

export const login = async (req, res) => {
  const { identifier, password } = req.body;
  ////// console.log("req.body", req.body);

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  ////// console.log("User from DB:", user); // Log the entire user object

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
  ////// console.log("###1 saving...");
  // await user.save(); // This line fails
  await user.save({ validateBeforeSave: false }); // skip validation
  ////// console.log("###2 success");

  res.json({ accessToken, refreshToken });
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

 //// console.log("### 1 :", refreshToken);

  if (!refreshToken) return res.status(401).json({ msg: "Token required" });

  try {
    // Find the user with the provided refresh token
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) return res.status(403).json({ msg: "Invalid refresh token" });
    ////// console.log("###2 :", user.refreshTokens);
   //// console.log("### 2");

    // verify the refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
   //// console.log("### 3");

    // generate new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );
   //// console.log("### 4");

    // Optionally, remove the used refresh token and add a new one
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );
   //// console.log("### 5");

    const newRefreshToken = jwt.sign(
      { id: user._id, username: user.username },
      REFRESH_SECRET
    );
   //// console.log("### 6");

    user.refreshTokens.push(newRefreshToken);
   //// console.log("### 7");

    // await user.save();
    await user.save({ validateBeforeSave: false });
   //// console.log("### 8");
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error(error);
    return res.status(403).json({ msg: "Token expired or invalid" });
  }
};
