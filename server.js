const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const karyawanRoutes = require("./routes/karyawanRoutes");
const essRoutes = require("./routes/essRoutes");
const hiringRoutes = require("./routes/hiringRoutes");
const roleRoutes = require("./routes/roleRoutes");
const protectedRoute = require("./routes/protectedRoute");
const uploadRoutes = require("./routes/uploadRoutes");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("Could not connect to MongoDB", error.message);
    process.exit(1); // Exit the process if cannot connect to MongoDB
  });

// Route to handle root URL
app.get("/", (req, res) => {
  res.send(
    "<h1>Server is running smoothly</h1><p>Welcome to the HR Dashboard API</p>"
  );
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/karyawan", karyawanRoutes);
app.use("/api/ess", essRoutes);
app.use("/api/hiring", hiringRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/protected", protectedRoute);
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
