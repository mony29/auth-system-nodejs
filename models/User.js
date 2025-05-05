import mongoose from "mongoose";

const EmailConfig = {
  type: String,
  required: false,
  unique: true,
  // sparse: true, // Only enforce uniqueness when email is provided
  lowercase: true,
  match: [
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    "Please enter a valid email",
  ],
};

const UsernameConfig = {
  type: String,
  required: false,
  unique: true,
  sparse: true, // Only enforce uniqueness when username is provided
  minlength: [4, "Username must be at least 4 characters"],
};

const PasswordConfig = {
  type: String,
  required: true,
  minlength: [6, "Password must be at least 6 characters"],
  validate: {
    validator: function (value) {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+^_=~()[\]{}|\\:;'",.<>/`-]).{6,}$/.test(
        value
      );
    },
    message:
      "Password must include lowercase, uppercase, number, and special character",
  },
};

const userSchema = new mongoose.Schema({
  username: UsernameConfig,
  email: EmailConfig,
  password: PasswordConfig,
  refreshTokens: [{ type: String }],
});

const User = mongoose.model("User", userSchema);
export default User;
