const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");

// Get All Users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().populate("role");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id }).populate("role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create User
router.post("/", async (req, res) => {
  try {
    // Generate unique userId
    const lastUser = await User.findOne().sort({ userId: -1 });
    const userId = lastUser
      ? `USR${(parseInt(lastUser.userId.slice(3)) + 1)
          .toString()
          .padStart(4, "0")}`
      : "USR0001";

    const roleData = await Role.findOne({ roleName: req.body.role });

    if (!roleData) {
      return res.status(400).json({ message: "Role not found" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      userId,
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      role: roleData._id, // Use the ID of the role
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error); // Logging error to debug
    res.status(400).json({ message: error.message });
  }
});

// Update User by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { userId: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete User by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ userId: req.params.id });
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
