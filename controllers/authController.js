import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ACCESS_SECRET, REFRESH_SECRET } from "../constants.js";
import {
  passwordRegex,
  pwdMustBeSixCharactersLongAndSpecial,
  userOrEmailAndPasswordRequired,
  registerSuccess,
  userAlreadyExists,
  userMustBeFourCharactersLong,
  userNotFound,
  pwdIncorrect,
  emailRegex,
  emailInvalid,
  allFieldsRequired,
  verifyCodeIsSent,
  invalidOrExpiredCode,
} from "../config.js";
import { sendVerificationEmail } from "../utils/mailer.js";
import VerificationCode from "../models/VerificationCode.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  // console.log("### 1 ", req.body);

  if ((!username && !email) || !password)
    return res.status(400).json({ msg: userOrEmailAndPasswordRequired });

  // Validate username if provided
  if (username && username.length < 4)
    return res.status(400).json({ msg: userMustBeFourCharactersLong });

  // Validate email if provided
  if (email && !emailRegex.test(email))
    return res.status(400).json({ msg: emailInvalid });

  // Validate password format
  if (!passwordRegex.test(password))
    return res.status(400).json({
      msg: pwdMustBeSixCharactersLongAndSpecial,
    });

  // Check existing user
  const exists = await User.findOne({
    $or: [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])],
  });
  if (exists) return res.status(400).json({ msg: userAlreadyExists });
  // console.log("### 2");
  // Create and save new user
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    ...(username && { username }),
    ...(email && { email }),
    password: hashedPassword,
  });

  // console.log("### 3");

  // await user.save({ validateBeforeSave: false });
  await user.save();
  // console.log("### 4");

  res.json({ msg: registerSuccess });
};

export const login = async (req, res) => {
  const { username, email, password } = req.body;
  // console.log("req.body", req.body);

  if (!password || (!username && !email))
    return res.status(400).json({ msg: userOrEmailAndPasswordRequired });

  let user;
  if (email) {
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: emailInvalid });
    }
    user = await User.findOne({
      email,
    });
    if (!user) return res.status(400).json({ msg: userNotFound });
  } else if (username) {
    user = await User.findOne({
      username,
    });
    if (!user) return res.status(400).json({ msg: userNotFound });
  }
  ////// // console.log("User from DB:", user); // Log the entire user object

  // if (!user) return res.status(400).json({ msg: userNotFound });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).json({ msg: pwdIncorrect });

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
  ////// // console.log("###1 saving...");
  // await user.save(); // This line fails
  await user.save({ validateBeforeSave: false }); // skip validation
  ////// // console.log("###2 success");

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

  //// // console.log("### 1 :", refreshToken);

  if (!refreshToken) return res.status(401).json({ msg: "Token required" });

  try {
    // Find the user with the provided refresh token
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) return res.status(403).json({ msg: "Invalid refresh token" });
    ////// // console.log("###2 :", user.refreshTokens);
    //// // console.log("### 2");

    // verify the refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    //// // console.log("### 3");

    // generate new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    //// //log("### 4");

    // Optionally, remove the used refresh token and add a new one
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );
    //// //log("### 5");

    const newRefreshToken = jwt.sign(
      { id: user._id, username: user.username },
      REFRESH_SECRET
    );
    //// //log("### 6");

    user.refreshTokens.push(newRefreshToken);
    //// //log("### 7");

    // await user.save();
    await user.save({ validateBeforeSave: false });
    //// //log("### 8");
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    //error(error);
    return res.status(403).json({ msg: "Token expired or invalid" });
  }
};

// send verification code
export const sendCode = async (req, res) => {
  // // console.log("## req.body", req.body);

  const { username, email, password } = req.body;
  if (!email || !username || !password)
    return res.status(400).json({ msg: allFieldsRequired });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ msg: userAlreadyExists });

  /** Random 6-digit number, 100000~999999 */
  const code = Math.floor(10000 + Math.random() * 900000).toString();
  // console.log("## code:", code);

  /** UpdateOrInsert verify code */
  await VerificationCode.findOneAndUpdate(
    { email },
    { code, expAt: new Date(Date.now() + 10 * 60 + 1000) },
    { upsert: true } // Update or Insert
  );

  await sendVerificationEmail(email, code);
  res.json({ msg: verifyCodeIsSent });
};

// verify code and register
export const verifyCodeAndRegister = async (req, res) => {
  try {
    const { username, email, password, code } = req.body;
    // console.log("## req.body", req.body);

    const record = await VerificationCode.findOne({ email, code });
    // console.log("## record:", record);

    if (!record)
      // if (!record || !record.expAt < new Date())
      return res.status(400).json({ msg: invalidOrExpiredCode });

    // console.log("## 1");
    const hashedPassword = await bcrypt.hash(password, 10);

    // console.log("## 1.1");

    await User.create({ email, username, password: hashedPassword });
    // console.log("## 2");

    await VerificationCode.deleteOne({ email }); // clean up
    // console.log("## 3");

    res.json({ msg: registerSuccess });
  } catch (error) {
    console.error("## Error in verifyAndRegister:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
