const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/", (req, res) => {

    console.log("req hit")
  res.status(200).json({
    message:"collabo "
  })
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});