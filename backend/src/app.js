const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");

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
const roleRouter = require("./routes/role.routes");
const milestoneRouter = require("./routes/milestone.routes");

const { securityHeaders, preventNoSqlAndXss } = require("./middleware/security.middleware");

const app = express();

app.set('trust proxy', 1);

app.use(compression());
app.use(securityHeaders);

const allowedOrigins = [
    "http://localhost:5173",
    "https://capstone-project-brown-zeta.vercel.app",
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/$/, '');
        if (
            allowedOrigins.includes(cleanOrigin) ||
            cleanOrigin.endsWith('.vercel.app') ||
            allowedOrigins.some(o => cleanOrigin.startsWith(o.replace(/\/$/, '')))
        ) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(preventNoSqlAndXss);

// Lightweight Root & Health Check endpoints for Render & Uptime monitoring
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Collabo API is running', uptime: process.uptime(), timestamp: new Date().toISOString() });
});
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter); 
app.use("/api/creator", creatorRouter);
app.use("/api/projects", projectRouter);
app.use("/api/application", applicationRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/workspace", workspaceRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/storage", storageRouter);
app.use("/api/ai", aiRouter);
app.use("/api/wallet", paymentRouter);
app.use("/api/roles", roleRouter);
app.use("/api/milestones", milestoneRouter);

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
