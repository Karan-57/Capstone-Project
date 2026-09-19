const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env")
});
const app = require('./src/app');
const connectDB = require('./src/config/database');
const config = require('./src/config/config');

connectDB();

const PORT = config.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} http://localhost:${PORT}`);
});