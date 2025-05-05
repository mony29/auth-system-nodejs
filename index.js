import express from "express";
import mongoose from "mongoose";
import MONGO_URI from "./config.js";
const PORT = process.env.PORT || 3000;
import authRoutes from './routes/authRoutes.js'

const app = express();
app.use(express.json());

app.use("/", authRoutes);

// Connect MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => console.error(err));
