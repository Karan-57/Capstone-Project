const mongoose = require("mongoose");
const config = require("./config");

async function connectDB() {
    try {
        console.log("Mongo URI:", config.MONGO_URI.replace(/\/\/.*@/, "//***@"));

        await mongoose.connect(config.MONGO_URI);

        console.log("MongoDB connected");
        console.log("Database name:", mongoose.connection.name);
        console.log("Host:", mongoose.connection.host);

    } catch (err) {
        console.log("Error connecting to database:", err);
        process.exit(1);
    }
}

module.exports = connectDB;