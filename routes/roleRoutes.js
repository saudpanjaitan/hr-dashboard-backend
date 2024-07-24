const express = require("express");
const router = express.Router();
const Role = require("../models/Role");

// Generate unique ID without external function
async function generateRoleId() {
  const lastRole = await Role.findOne().sort({ roleId: -1 });
  let nextIdNumber = 1;

  if (lastRole && lastRole.roleId) {
    const lastIdNumber = parseInt(lastRole.roleId.slice(3), 10);
    nextIdNumber = lastIdNumber + 1;
  }

  const nextId = `ROL${String(nextIdNumber).padStart(4, "0")}`;
  return nextId;
}

// Get All Roles
router.get("/", async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Role by Role ID
router.get("/:roleId", async (req, res) => {
  try {
    const role = await Role.findOne({ roleId: req.params.roleId });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Role
router.post("/", async (req, res) => {
  try {
    if (!req.body.roleName) {
      return res.status(400).json({ message: "roleName is required" });
    }

    // Check if the roleName already exists
    const existingRole = await Role.findOne({ roleName: req.body.roleName });
    if (existingRole) {
      return res.status(400).json({ message: "Role name already exists" });
    }

    const roleId = await generateRoleId();
    const newRole = new Role({
      roleId,
      roleName: req.body.roleName,
      description: req.body.description,
      accessPages: req.body.accessPages,
      actions: req.body.actions,
    });

    await newRole.save();
    res.status(201).json(newRole);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Role by ID
router.delete("/:roleId", async (req, res) => {
  try {
    const role = await Role.findOneAndDelete({ roleId: req.params.roleId });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Role by ID
router.put("/:roleId", async (req, res) => {
  try {
    const updatedRole = await Role.findOneAndUpdate(
      { roleId: req.params.roleId },
      {
        roleName: req.body.roleName,
        description: req.body.description,
        accessPages: req.body.accessPages,
        actions: req.body.actions,
      },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json(updatedRole);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
