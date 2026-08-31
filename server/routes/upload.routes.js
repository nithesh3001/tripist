const express = require("express");
const upload = require("../middleware/upload");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/upload - field name "image"
router.post("/", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});

module.exports = router;
