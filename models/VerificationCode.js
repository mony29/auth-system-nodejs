import mongoose from "mongoose";

const verificationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expAt: { type: Date, required: true },
});

export default mongoose.model("VerificationCode", verificationCodeSchema);
