const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.routes");
const usersRouter = require("./routes/users.routes");
const creatorRouter = require("./routes/creator.routes");
const projectRouter = require("./routes/projects.routes");
const applicationRouter = require("./routes/application.routes");
const portfolioRouter = require("./routes/portfolio.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter); 
app.use("/api/creator", creatorRouter);
app.use("/api/projects", projectRouter);
app.use("/api/application", applicationRouter);
app.use("/api/portfolio", portfolioRouter);

//for testing only not for real project
// Global error handler (handles Multer errors, file type rejections, etc.)
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('image files are allowed')) {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size allowed is 5MB.' });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Internal server error", error: err.message });
});

module.exports = app;