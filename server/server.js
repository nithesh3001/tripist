require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const packageRoutes = require("./routes/packages.routes");
const contactRoutes = require("./routes/contact.routes");
const noticeRoutes = require("./routes/notice.routes");
const uploadRoutes = require("./routes/upload.routes");
const emailRoutes = require("./routes/email.routes");
const destinationRoutes = require("./routes/destinationRoutes");

const app = express();

// ============================================================
// CORS CONFIGURATION
// ============================================================
const allowedOrigins = [
  "https://nithesh3001.github.io",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:5000",
];

// If CLIENT_ORIGIN is set in Render, clean up any trailing slash and add it
if (process.env.CLIENT_ORIGIN && process.env.CLIENT_ORIGIN !== "*") {
  const cleanEnvOrigin = process.env.CLIENT_ORIGIN.replace(/\/$/, "");
  if (!allowedOrigins.includes(cleanEnvOrigin)) {
    allowedOrigins.push(cleanEnvOrigin);
  }
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Allow wildcard or matched origins
      if (
        process.env.CLIENT_ORIGIN === "*" ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Blocked by CORS for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ============================================================
// MIDDLEWARE & ROUTES
// ============================================================
app.use(express.json({ limit: "2mb" }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/notice", noticeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/destinations", destinationRoutes);

// Multer / generic error handler
app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || "Something went wrong" });
  }
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Tripist Admin API running on http://localhost:${PORT}`);
});