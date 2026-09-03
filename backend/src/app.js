const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "collabo API is running"
  });
});

module.exports = app;