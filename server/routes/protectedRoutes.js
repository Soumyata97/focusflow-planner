const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Protected test route
router.get("/dashboard", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Access granted to protected route",
    user: req.user,
  });
});

module.exports = router;
