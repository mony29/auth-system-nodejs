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
