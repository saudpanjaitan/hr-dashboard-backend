const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Example endpoint protected for role User
router.get("/employee-self-service", authMiddleware(["User"]), (req, res) => {
  res.json({
    message: "This is an employee self service route",
    user: req.user,
  });
});

// Example endpoint protected for role Superior
router.get(
  "/performance-review",
  authMiddleware(["Superior", "Supersuperior"]),
  (req, res) => {
    res.json({ message: "This is a performance review route", user: req.user });
  }
);

// Example endpoint protected for role Administrator
router.get("/admin", authMiddleware(["Administrator"]), (req, res) => {
  res.json({ message: "This is an admin route", user: req.user });
});

module.exports = router;
