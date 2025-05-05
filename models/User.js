import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },
  password: { type: String, required: true },
  refreshTokens: [{ type: String }],
});

const User = mongoose.model("User", userSchema);
export default User;
