const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.routes");
const usersRouter = require("./routes/users.routes");
const creatorRouter = require("./routes/creator.routes");
const projectRouter = require("./routes/projects.routes");
const applicationRouter = require("./routes/application.routes");
const portfolioRouter = require("./routes/portfolio.routes");
const workspaceRouter = require("./routes/workspace.routes");
const notificationRouter = require("./routes/notification.routes");
const conversationRouter = require("./routes/conversation.routes");
const storageRouter = require("./routes/storage.routes");
const aiRouter = require("./routes/ai.routes");
const paymentRouter = require("./routes/payment.routes");

const { securityHeaders, preventNoSqlAndXss } = require("./middleware/security.middleware");

const app = express();

app.use(securityHeaders);
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(preventNoSqlAndXss);

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter); 
app.use("/api/creator", creatorRouter);
app.use("/api/projects", projectRouter);
app.use(["/api/application", "/api/applications"], applicationRouter);
app.use("/api/portfolio", portfolioRouter);
app.use(["/api/workspace", "/api/workspaces"], workspaceRouter);
app.use("/api/notifications", notificationRouter);
app.use(["/api/conversation", "/api/conversations"], conversationRouter);
app.use("/api/storage", storageRouter);
app.use("/api/ai", aiRouter);
app.use(["/api/payment", "/api/payments", "/api/wallet"], paymentRouter);

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